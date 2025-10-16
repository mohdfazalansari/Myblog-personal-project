package myblog.com.Myblog.DTOs;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class CategoryDto {
    @NotEmpty(message = "Category name cannot be empty")
    private String name;
    private String description;
}