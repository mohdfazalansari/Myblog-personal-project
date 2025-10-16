package myblog.com.Myblog.Service;

import lombok.RequiredArgsConstructor;
import myblog.com.Myblog.DTOs.CategoryDto;
import myblog.com.Myblog.Entity.Category;
import myblog.com.Myblog.Exception.ResourceNotFoundException;
import myblog.com.Myblog.Repository.CategoryRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public Category createCategory(CategoryDto categoryDto) {
        Category category = new Category();
        category.setName(categoryDto.getName());
        category.setDescription(categoryDto.getDescription());
        return categoryRepository.save(category);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    public void deleteCategory(String id) {
        Category category = getCategoryById(id);
        // Optional: Before deleting, you might want to re-categorize posts under this category.
        // For simplicity, we'll just delete it.
        categoryRepository.delete(category);
    }
}