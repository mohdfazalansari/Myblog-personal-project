package myblog.com.Myblog.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import myblog.com.Myblog.DTOs.PostDto;
import myblog.com.Myblog.Entity.Category;
import myblog.com.Myblog.Entity.Post;
import myblog.com.Myblog.Entity.User;
import myblog.com.Myblog.Exception.ResourceNotFoundException;
import myblog.com.Myblog.Exception.UnauthorizedOperationException;

import org.springframework.security.core.userdetails.UsernameNotFoundException;

//import myblog.com.Myblog.Exception.UsernameNotFoundException;
import myblog.com.Myblog.Repository.CategoryRepository;
import myblog.com.Myblog.Repository.PostRepository;
import myblog.com.Myblog.Repository.UserRepository;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Post createPost(PostDto postDto, String userEmail) {
        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Category category = categoryRepository.findById(postDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Post post = new Post();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setAuthor(author);
        post.setCategory(category);
        post.setCreatedAt(LocalDateTime.now());
        post.setImageUrl(postDto.getImageUrl());

        return postRepository.save(post);
    }
    //... other methods like getPostById, updatePost, deletePost
    /*getPostByID */
    public Post getPostById(String id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
    }
    /**
     * Updates an existing post after verifying the user is the original author.
     */
    public Post updatePost(String postId, PostDto postDetails, String userEmail) {
        Post post = getPostById(postId);
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // SECURITY CHECK: Ensure the current user is the author of the post
         if (!post.getAuthor().equals(currentUser)) {
            throw new UnauthorizedOperationException("User is not authorized to update this post");
        }

        post.setTitle(postDetails.getTitle());
        post.setContent(postDetails.getContent());
        post.setUpdatedAt(LocalDateTime.now());
        
        // You could also allow changing the category here if desired
        // Category category = categoryRepository.findById(postDetails.getCategoryId()).orElseThrow(...);
        // post.setCategory(category);
        post.setImageUrl(postDetails.getImageUrl());
        
        return postRepository.save(post);
    }
     /**
     * Deletes a post after verifying the user is the original author.
     */
    public void deletePost(String postId, String userEmail) {
        Post post = getPostById(postId);
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // SECURITY CHECK: Ensure the current user is the author of the post
         if (!post.getAuthor().equals(currentUser)) {
            throw new UnauthorizedOperationException("User is not authorized to update this post");
        }

        postRepository.delete(post);
    }
}