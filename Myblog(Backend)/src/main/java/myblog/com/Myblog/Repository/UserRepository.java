package myblog.com.Myblog.Repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import myblog.com.Myblog.Entity.User;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
}