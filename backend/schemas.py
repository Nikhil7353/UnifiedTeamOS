from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


# --------
# Users
# --------
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    profile_pic: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    profile_pic: Optional[str] = None

    class Config:
        from_attributes = True


# --------
# Tasks
# --------
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "TODO"


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    status: str


class TaskOut(TaskBase):
    id: int
    assigned_user_id: Optional[int] = None

    class Config:
        from_attributes = True


# --------
# Channels & Members
# --------
class ChannelBase(BaseModel):
    name: str
    is_private: bool = False


class ChannelCreate(ChannelBase):
    pass


class ChannelOut(ChannelBase):
    id: int

    class Config:
        from_attributes = True


class ChannelMemberBase(BaseModel):
    user_id: int
    channel_id: int
    role: str = "member"


class ChannelMemberCreate(ChannelMemberBase):
    pass


class ChannelMemberOut(ChannelMemberBase):
    id: int

    class Config:
        from_attributes = True


# --------
# Messages
# --------
class MessageBase(BaseModel):
    content: str
    message_type: Optional[str] = "text"
    thread_id: Optional[int] = None


class MessageCreate(MessageBase):
    pass


class MessageOut(MessageBase):
    id: int
    sender_id: int
    channel_id: int
    timestamp: Optional[str] = None
    thread_id: Optional[int] = None
    sender: Optional[UserOut] = None

    class Config:
        from_attributes = True


# --------
# Files
# --------
class FileAttachmentOut(BaseModel):
    id: int
    filename: str
    file_url: str
    file_size: int
    file_type: str
    uploader_id: int

    class Config:
        from_attributes = True


# --------
# Notifications
# --------
class NotificationType(str, Enum):
    MENTION = "mention"
    MESSAGE = "message"
    TASK = "task"
    SYSTEM = "system"

class SourceType(str, Enum):
    CHANNEL = "channel"
    DM = "dm"
    TASK = "task"
    SYSTEM = "system"

class NotificationBase(BaseModel):
    type: NotificationType
    source_id: int
    source_type: SourceType
    title: str
    preview: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationOut(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserPreferenceBase(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    desktop_notifications: bool = True
    mute_mentions_until: Optional[datetime] = None

class UserPreferenceUpdate(UserPreferenceBase):
    pass

class UserPreferenceOut(UserPreferenceBase):
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True

class NotificationList(BaseModel):
    items: List[NotificationOut]
    total: int
    unread_count: int


# --------
# Inbox
# --------
class InboxItemOut(BaseModel):
    id: str
    source: str
    source_id: int
    title: str
    preview: str
    meta: Optional[dict] = None
    unread: bool = False
    pinned: bool = False
    tags: List[str] = []


class InboxList(BaseModel):
    items: List[InboxItemOut]
    total: int
    unread_count: int
    pinned_count: int


class InboxItemPinUpdate(BaseModel):
    pinned: bool


class InboxItemPinOut(BaseModel):
    source: str
    source_id: int
    pinned: bool


class InboxItemReadUpdate(BaseModel):
    is_read: bool


class InboxItemReadOut(BaseModel):
    source: str
    source_id: int
    is_read: bool


# --------
# Email
# --------
class EmailAccountBase(BaseModel):
    provider: str = "imap_smtp"
    display_name: Optional[str] = ""
    email_address: str

    imap_host: str
    imap_port: int = 993
    imap_username: str
    imap_password: str

    smtp_host: str
    smtp_port: int = 587
    smtp_username: str
    smtp_password: str
    smtp_use_tls: bool = True
    from_email: Optional[str] = None


class EmailAccountCreate(EmailAccountBase):
    pass


class EmailAccountOut(BaseModel):
    id: int
    user_id: int
    provider: str = "imap_smtp"
    display_name: Optional[str] = ""
    email_address: str

    imap_host: str
    imap_port: int = 993
    imap_username: str

    smtp_host: str
    smtp_port: int = 587
    smtp_username: str
    smtp_use_tls: bool = True
    from_email: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmailThreadOut(BaseModel):
    id: int
    account_id: int
    thread_key: str
    subject: str
    snippet: str
    last_from: str
    updated_at: datetime

    class Config:
        from_attributes = True


class EmailMessageOut(BaseModel):
    id: int
    account_id: int
    thread_id: int
    message_id: Optional[str] = None
    subject: str
    from_email: str
    to_email: str
    date_raw: str
    body_preview: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class EmailSyncResult(BaseModel):
    imported: int


class EmailSendRequest(BaseModel):
    to_email: str
    subject: str
    body: str
    is_html: bool = False


class EmailSendResult(BaseModel):
    sent: bool


class EmailMessageReadUpdate(BaseModel):
    is_read: bool = True


class EmailThreadList(BaseModel):
    items: List[EmailThreadOut]
    total: int
    unread_count: int


class EmailMessageList(BaseModel):
    items: List[EmailMessageOut]
    total: int
    unread_count: int


# --------
# Docs
# --------
class DocumentCreate(BaseModel):
    title: str = "Untitled"
    content: str = ""


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class DocumentOut(BaseModel):
    id: int
    owner_id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentCommentCreate(BaseModel):
    body: str


class DocumentCommentOut(BaseModel):
    id: int
    document_id: int
    author_id: int
    body: str
    created_at: datetime

    class Config:
        from_attributes = True


# --------
# Voice
# --------
class VoiceRoomCreate(BaseModel):
    name: str


class VoiceRoomOut(BaseModel):
    id: int
    name: str
    created_by_id: Optional[int] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class VoiceRoomParticipantOut(BaseModel):
    id: int
    room_id: int
    user_id: int
    joined_at: datetime
    is_muted: bool
    is_speaking: bool

    class Config:
        from_attributes = True


# --------
# Video
# --------
class VideoCallCreate(BaseModel):
    name: str


class VideoCallOut(BaseModel):
    id: int
    name: str
    created_by_id: Optional[int] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class VideoJoinUpdate(BaseModel):
    video_enabled: bool = True
    audio_enabled: bool = True


class VideoCallParticipantOut(BaseModel):
    id: int
    call_id: int
    user_id: int
    joined_at: datetime
    video_enabled: bool
    audio_enabled: bool

    class Config:
        from_attributes = True


# --------
# Whiteboard
# --------
class WhiteboardBoardCreate(BaseModel):
    title: str = "Whiteboard"


class WhiteboardBoardOut(BaseModel):
    id: int
    title: str
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WhiteboardStrokeCreate(BaseModel):
    stroke_data: str


class WhiteboardStrokeOut(BaseModel):
    id: int
    board_id: int
    author_id: Optional[int] = None
    stroke_data: str
    created_at: datetime

    class Config:
        from_attributes = True


# --------
# Search
# --------
class SearchResults(BaseModel):
    q: str
    tasks: List[TaskOut]
    messages: List[MessageOut]
    documents: List[DocumentOut]
    emails: List[EmailMessageOut]