from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    tasks = relationship("Task", back_populates="assigned_user", cascade="all, delete")
    messages = relationship("Message", back_populates="sender", cascade="all, delete")
    channel_memberships = relationship("ChannelMember", back_populates="user", cascade="all, delete")
    uploads = relationship("FileAttachment", back_populates="uploader", cascade="all, delete")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete")
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete")
    email_accounts = relationship("EmailAccount", back_populates="user", cascade="all, delete")
    documents = relationship("Document", back_populates="owner", cascade="all, delete")
    document_comments = relationship("DocumentComment", back_populates="author", cascade="all, delete")
    voice_room_participations = relationship("VoiceRoomParticipant", back_populates="user", cascade="all, delete")
    video_call_participations = relationship("VideoCallParticipant", back_populates="user", cascade="all, delete")
    whiteboard_strokes = relationship("WhiteboardStroke", back_populates="author", cascade="all, delete")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String, default="")
    status = Column(String, default="TODO")  # TODO, IN_PROGRESS, DONE

    assigned_user_id = Column(Integer, ForeignKey("users.id"))
    assigned_user = relationship("User", back_populates="tasks")


class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    is_private = Column(Boolean, default=False)

    members = relationship("ChannelMember", back_populates="channel", cascade="all, delete")
    messages = relationship("Message", back_populates="channel", cascade="all, delete")


class ChannelMember(Base):
    __tablename__ = "channel_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    channel_id = Column(Integer, ForeignKey("channels.id"))
    role = Column(String, default="member")

    user = relationship("User", back_populates="channel_memberships")
    channel = relationship("Channel", back_populates="members")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    message_type = Column(String, default="text")
    thread_id = Column(Integer, nullable=True)

    sender_id = Column(Integer, ForeignKey("users.id"))
    channel_id = Column(Integer, ForeignKey("channels.id"))

    sender = relationship("User", back_populates="messages")
    channel = relationship("Channel", back_populates="messages")


class FileAttachment(Base):
    __tablename__ = "file_attachments"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    file_url = Column(String)
    file_size = Column(Integer)
    file_type = Column(String)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    uploader_id = Column(Integer, ForeignKey("users.id"))
    uploader = relationship("User", back_populates="uploads")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    type = Column(String(50), nullable=False)  # 'message', 'mention', 'email', 'system'
    source_id = Column(Integer)  # message_id, email_id, etc.
    source_type = Column(String(50))  # 'channel', 'dm', 'email', 'task'
    title = Column(String(255))
    preview = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


class InboxPin(Base):
    __tablename__ = "inbox_pins"
    __table_args__ = (
        UniqueConstraint("user_id", "source", "source_id", name="uq_inbox_pins_user_source_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    source = Column(String(50), nullable=False)  # 'email', 'notification', 'task'
    source_id = Column(Integer, nullable=False)

    user = relationship("User")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    desktop_notifications = Column(Boolean, default=True)
    mute_mentions_until = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="preferences")


class EmailAccount(Base):
    __tablename__ = "email_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)

    provider = Column(String, default="imap_smtp")
    display_name = Column(String, default="")
    email_address = Column(String, index=True)

    imap_host = Column(String)
    imap_port = Column(Integer, default=993)
    imap_username = Column(String)
    imap_password = Column(String)

    smtp_host = Column(String)
    smtp_port = Column(Integer, default=587)
    smtp_username = Column(String)
    smtp_password = Column(String)
    smtp_use_tls = Column(Boolean, default=True)
    from_email = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="email_accounts")
    threads = relationship("EmailThread", back_populates="account", cascade="all, delete")
    messages = relationship("EmailMessage", back_populates="account", cascade="all, delete")


class EmailThread(Base):
    __tablename__ = "email_threads"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("email_accounts.id", ondelete="CASCADE"), index=True)

    thread_key = Column(String, index=True)
    subject = Column(String, default="")
    snippet = Column(Text, default="")
    last_from = Column(String, default="")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    account = relationship("EmailAccount", back_populates="threads")
    messages = relationship("EmailMessage", back_populates="thread", cascade="all, delete")


class EmailMessage(Base):
    __tablename__ = "email_messages"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("email_accounts.id", ondelete="CASCADE"), index=True)
    thread_id = Column(Integer, ForeignKey("email_threads.id", ondelete="CASCADE"), index=True)

    message_id = Column(String, nullable=True, index=True)
    subject = Column(String, default="")
    from_email = Column(String, default="")
    to_email = Column(String, default="")
    date_raw = Column(String, default="")
    body_preview = Column(Text, default="")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    account = relationship("EmailAccount", back_populates="messages")
    thread = relationship("EmailThread", back_populates="messages")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title = Column(String, default="Untitled")
    content = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="documents")
    comments = relationship("DocumentComment", back_populates="document", cascade="all, delete")


class DocumentComment(Base):
    __tablename__ = "document_comments"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    body = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="comments")
    author = relationship("User", back_populates="document_comments")


class VoiceRoom(Base):
    __tablename__ = "voice_rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    participants = relationship("VoiceRoomParticipant", back_populates="room", cascade="all, delete")


class VoiceRoomParticipant(Base):
    __tablename__ = "voice_room_participants"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("voice_rooms.id", ondelete="CASCADE"), index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    is_muted = Column(Boolean, default=False)
    is_speaking = Column(Boolean, default=False)

    room = relationship("VoiceRoom", back_populates="participants")
    user = relationship("User", back_populates="voice_room_participations")


class VideoCall(Base):
    __tablename__ = "video_calls"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    participants = relationship("VideoCallParticipant", back_populates="call", cascade="all, delete")


class VideoCallParticipant(Base):
    __tablename__ = "video_call_participants"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("video_calls.id", ondelete="CASCADE"), index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    video_enabled = Column(Boolean, default=True)
    audio_enabled = Column(Boolean, default=True)

    call = relationship("VideoCall", back_populates="participants")
    user = relationship("User", back_populates="video_call_participations")


class WhiteboardBoard(Base):
    __tablename__ = "whiteboard_boards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="Whiteboard")
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    strokes = relationship("WhiteboardStroke", back_populates="board", cascade="all, delete")


class WhiteboardStroke(Base):
    __tablename__ = "whiteboard_strokes"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("whiteboard_boards.id", ondelete="CASCADE"), index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    stroke_data = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    board = relationship("WhiteboardBoard", back_populates="strokes")
    author = relationship("User", back_populates="whiteboard_strokes")