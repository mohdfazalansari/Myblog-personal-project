package myblog.com.Myblog.Repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import myblog.com.Myblog.Entity.Category;
import myblog.com.Myblog.Entity.Post;
import myblog.com.Myblog.Entity.User;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByCategory(Category category);
    List<Post> findByAuthor(User author);
}