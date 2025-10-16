package myblog.com.Myblog.DTOs;

import lombok.Data;

@Data
public class PostDto {
    private String title;
    private String content;
    private String categoryId;
    private String imageUrl;
}