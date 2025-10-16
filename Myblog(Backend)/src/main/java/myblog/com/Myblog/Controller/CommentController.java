package myblog.com.Myblog.Controller;

import myblog.com.Myblog.DTOs.CommentDto;
import myblog.com.Myblog.Entity.Comment;
import myblog.com.Myblog.Service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;


@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // AUTHENTICATED: Only registered users can add a comment to a post
    @PostMapping
    public ResponseEntity<Comment> addComment(
            @PathVariable String postId,
            @Valid @RequestBody CommentDto commentDto,
            Principal principal) {
        
        Comment newComment = commentService.addCommentToPost(postId, commentDto, principal.getName());
        return new ResponseEntity<>(newComment, HttpStatus.CREATED);
    }
}