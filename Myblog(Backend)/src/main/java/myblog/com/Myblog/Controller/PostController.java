package myblog.com.Myblog.Controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import myblog.com.Myblog.DTOs.PostDto;
import myblog.com.Myblog.Entity.Post;
import myblog.com.Myblog.Service.PostService;


@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // PUBLIC: Anyone can view all posts
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }
     
    // PUBLIC: Anyone can view a single post by its ID
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable String id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    // AUTHENTICATED: Only registered users can create a post
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody PostDto postDto, Principal principal) {
        // Principal.getName() will return the username (email in our case)
        Post createdPost = postService.createPost(postDto, principal.getName());
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }
    
    //... other endpoints like GET /{id}, PUT /{id}, DELETE /{id}
    // AUTHENTICATED: Only the author can update their post
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable String id, @RequestBody PostDto postDto, Principal principal) {
        Post updatedPost = postService.updatePost(id, postDto, principal.getName());
        return ResponseEntity.ok(updatedPost);
    }
    
    // AUTHENTICATED: Only the author can delete their post
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(@PathVariable String id, Principal principal) {
        postService.deletePost(id, principal.getName());
        return ResponseEntity.ok("Post deleted successfully.");
    }
}