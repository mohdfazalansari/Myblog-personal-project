package myblog.com.Myblog.DTOs;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class CommentDto {
    @NotEmpty(message = "Comment content cannot be empty")
    private String content;
}