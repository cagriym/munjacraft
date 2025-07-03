# Proje Veritabanı Şeması (ER Diagram)

Bu dosya, projenin veritabanı modelleri ve aralarındaki ilişkileri gösteren bir Varlık-İlişki (ER) diyagramı içerir. Diyagram, [Mermaid.js](https://mermaid-js.github.io/mermaid/#/) sözdizimi kullanılarak oluşturulmuştur.

```mermaid
erDiagram
    User ||--o{ Message : "sends/receives"
    User ||--o{ Announcement : "creates"
    User ||--o{ Friend : "has"
    User ||--o{ UploadedFile : "uploads"
    User ||--o{ SearchHistory : "has"

    User {
        Int id PK
        String email "unique"
        String nickname "unique"
        Role role
        Rank rank
        Boolean isBanned
    }

    Message {
        Int id PK
        Int senderId FK
        Int receiverId FK
        String content
        Boolean seen
    }

    Announcement {
        Int id PK
        String title
        Int authorId FK
    }

    Friend {
        Int id PK
        Int requesterId FK
        Int addresseeId FK
        FriendStatus status
    }

    UploadedFile {
        Int id PK
        String url
        Int userId FK
    }

    SearchHistory {
        Int id PK
        String query
        Int userId FK
    }
```
