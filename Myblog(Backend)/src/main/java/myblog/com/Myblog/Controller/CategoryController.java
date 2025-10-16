package myblog.com.Myblog.Controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import myblog.com.Myblog.DTOs.CategoryDto;
import myblog.com.Myblog.Entity.Category;
import myblog.com.Myblog.Service.*;

import java.util.List;


@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // AUTHENTICATED: Only authenticated users can create categories
    @PostMapping
    public ResponseEntity<Category> createCategory(@Valid @RequestBody CategoryDto categoryDto) {
        Category createdCategory = categoryService.createCategory(categoryDto);
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }

    // PUBLIC: Anyone can view all categories
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    // PUBLIC: Anyone can view a single category
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable String id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    // AUTHENTICATED: Only authenticated users can delete categories
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("Category deleted successfully.");
    }
}