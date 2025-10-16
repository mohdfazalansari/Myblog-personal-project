package myblog.com.Myblog.Entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    @Id
    private String id;
    private String title;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @DBRef
    private User author;

    @DBRef
    private Category category;

    @DBRef
    private List<Comment> comments = new ArrayList<>();
}