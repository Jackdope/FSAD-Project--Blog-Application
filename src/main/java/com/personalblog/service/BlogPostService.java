package com.personalblog.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.personalblog.dto.BlogPostRequest;
import com.personalblog.dto.BlogPostResponse;
import com.personalblog.entity.BlogPost;
import com.personalblog.entity.User;
import com.personalblog.exception.ResourceNotFoundException;
import com.personalblog.exception.UnauthorizedException;
import com.personalblog.repository.BlogPostRepository;
import com.personalblog.repository.UserRepository;

@Service
public class BlogPostService {

    private static final Logger log = LoggerFactory.getLogger(BlogPostService.class);
    
    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private UserRepository userRepository;

    public BlogPostResponse createBlogPost(String username, BlogPostRequest request) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BlogPost blogPost = new BlogPost();
        blogPost.setTitle(request.getTitle());
        blogPost.setContent(request.getContent());
        blogPost.setImageUrl(request.getImageUrl());
        blogPost.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : true);
        blogPost.setTags(request.getTags());
        blogPost.setCategory(request.getCategory());
        blogPost.setAuthor(author);
        blogPost.setCreatedAt(LocalDateTime.now());
        blogPost.setUpdatedAt(LocalDateTime.now());

        blogPost = blogPostRepository.save(blogPost);

        return convertToResponse(blogPost);
    }

    public BlogPostResponse getBlogPost(Long postId) {
        BlogPost blogPost = blogPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));

        return convertToResponse(blogPost);
    }

    public List<BlogPostResponse> getAllBlogPosts() {
        return blogPostRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<BlogPostResponse> getPublicBlogPosts() {
        return blogPostRepository.findByIsPublicTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<BlogPostResponse> searchByTag(String tag) {
        return blogPostRepository.findByTagsContainingIgnoreCaseAndIsPublicTrueOrderByCreatedAtDesc(tag)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<BlogPostResponse> getUserBlogPosts(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return blogPostRepository.findByAuthorIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public BlogPostResponse updateBlogPost(Long postId, String username, BlogPostRequest request) {
        BlogPost blogPost = blogPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));

        // Check if user is the author
        if (!blogPost.getAuthor().getUsername().equals(username)) {
            throw new UnauthorizedException("You can only edit your own blog posts");
        }

        blogPost.setTitle(request.getTitle());
        blogPost.setContent(request.getContent());
        if (request.getImageUrl() != null) {
            blogPost.setImageUrl(request.getImageUrl());
        }
        if (request.getIsPublic() != null) {
            blogPost.setIsPublic(request.getIsPublic());
        }
        if (request.getTags() != null) {
            blogPost.setTags(request.getTags());
        }
        if (request.getCategory() != null) {
            blogPost.setCategory(request.getCategory());
        }
        blogPost.setUpdatedAt(LocalDateTime.now());

        blogPost = blogPostRepository.save(blogPost);

        return convertToResponse(blogPost);
    }

    public void deleteBlogPost(Long postId, String username) {
        BlogPost blogPost = blogPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));

        // Check if user is the author
        if (!blogPost.getAuthor().getUsername().equals(username)) {
            throw new UnauthorizedException("You can only delete your own blog posts");
        }

        blogPostRepository.deleteById(postId);
    }

    public String saveImage(MultipartFile file) throws java.io.IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        String uploadsDir = "uploads";
        java.io.File uploadsFolder = new java.io.File(uploadsDir);
        if (!uploadsFolder.exists()) {
            uploadsFolder.mkdirs();
        }
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = java.util.UUID.randomUUID() + extension;
        java.nio.file.Path filePath = java.nio.file.Paths.get(uploadsDir, uniqueFilename);
        java.nio.file.Files.copy(file.getInputStream(), filePath);
        return "/uploads/" + uniqueFilename;
    }

    private BlogPostResponse convertToResponse(BlogPost blogPost) {
        return new BlogPostResponse(
                blogPost.getId(),
                blogPost.getTitle(),
                blogPost.getContent(),
                blogPost.getImageUrl(),
                blogPost.getIsPublic(),
                blogPost.getTags(),
                blogPost.getCategory(),
                blogPost.getAuthor().getUsername(),
                blogPost.getAuthor().getId(),
                blogPost.getCreatedAt(),
                blogPost.getUpdatedAt()
        );
    }
}
