package myblog.com.Myblog.Service;


import lombok.RequiredArgsConstructor;
import myblog.com.Myblog.DTOs.CommentDto;
import myblog.com.Myblog.Entity.Comment;
import myblog.com.Myblog.Entity.Post;
import myblog.com.Myblog.Entity.User;
import myblog.com.Myblog.Exception.ResourceNotFoundException;
import myblog.com.Myblog.Repository.CommentRepository;
import myblog.com.Myblog.Repository.PostRepository;
import myblog.com.Myblog.Repository.UserRepository;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public Comment addCommentToPost(String postId, CommentDto commentDto, String userEmail) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
        
        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        Comment comment = new Comment();
        comment.setContent(commentDto.getContent());
        comment.setAuthor(author);
        comment.setCreatedAt(LocalDateTime.now());
        
        // First, save the standalone comment document
        Comment savedComment = commentRepository.save(comment);

        // Then, add its reference to the post's comment list and update the post
        post.getComments().add(savedComment);
        postRepository.save(post);

        return savedComment;
    }
}