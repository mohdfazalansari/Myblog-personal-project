package myblog.com.Myblog.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    private String id;
    private String name;
    private String description;
}