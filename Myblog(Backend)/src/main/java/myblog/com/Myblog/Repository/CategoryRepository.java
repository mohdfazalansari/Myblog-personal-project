package myblog.com.Myblog.Repository;


import org.springframework.data.mongodb.repository.MongoRepository;

import myblog.com.Myblog.Entity.Category;

public interface CategoryRepository extends MongoRepository<Category, String> {
}