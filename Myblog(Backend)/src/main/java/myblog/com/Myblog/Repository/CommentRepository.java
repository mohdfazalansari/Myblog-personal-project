package myblog.com.Myblog.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import myblog.com.Myblog.Entity.Comment;

public interface CommentRepository extends MongoRepository<Comment, String> {
}