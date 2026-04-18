package com.personalblog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BlogPostRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(min = 10, message = "Content must be at least 10 characters")
    private String content;

    // Optional: imageUrl for post creation with image
    private String imageUrl;

    // Optional: isPublic flag (default true)
    private Boolean isPublic = true;

    // Optional: tags (comma-separated)
    private String tags;

    // Optional: category
    private String category;

    public BlogPostRequest() {
    }

    public BlogPostRequest(String title, String content, String imageUrl, Boolean isPublic, String tags, String category) {
        this.title = title;
        this.content = content;
        this.imageUrl = imageUrl;
        this.isPublic = isPublic;
        this.tags = tags;
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}

