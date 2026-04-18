package com.personalblog.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.personalblog.dto.BlogPostRequest;
import com.personalblog.dto.BlogPostResponse;
import com.personalblog.service.BlogPostService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class BlogPostController {
    
    @Autowired
    private BlogPostService blogPostService;

    @GetMapping
    public ResponseEntity<List<BlogPostResponse>> getAllPosts() {
        List<BlogPostResponse> posts = blogPostService.getAllBlogPosts();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/public")
    public ResponseEntity<List<BlogPostResponse>> getPublicPosts() {
        List<BlogPostResponse> posts = blogPostService.getPublicBlogPosts();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/search")
    public ResponseEntity<List<BlogPostResponse>> searchByTag(@RequestParam String keyword) {
        List<BlogPostResponse> posts = blogPostService.searchByTag(keyword);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogPostResponse> getPost(@PathVariable Long id) {
        BlogPostResponse post = blogPostService.getBlogPost(id);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<BlogPostResponse>> getCurrentUserPosts() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());
            }
            String username = authentication.getName();
            List<BlogPostResponse> posts = blogPostService.getUserBlogPosts(username);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<BlogPostResponse>> getUserPosts(@PathVariable String username) {
        List<BlogPostResponse> posts = blogPostService.getUserBlogPosts(username);
        return ResponseEntity.ok(posts);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BlogPostResponse> createPost(@Valid @RequestBody BlogPostRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        BlogPostResponse post = blogPostService.createBlogPost(username, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BlogPostResponse> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody BlogPostRequest request) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        BlogPostResponse post = blogPostService.updateBlogPost(id, username, request);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        blogPostService.deleteBlogPost(id, username);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        String imagePath = blogPostService.saveImage(file);
        return ResponseEntity.ok(imagePath);
    }
}
