package myblog.com.Myblog.Entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    @Id
    private String id;
    private String content;
    private LocalDateTime createdAt;

    @DBRef
    private User author;
}