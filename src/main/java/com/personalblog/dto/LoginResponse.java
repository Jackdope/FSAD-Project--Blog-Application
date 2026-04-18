package com.personalblog.dto;

public class LoginResponse {
    private String token;
    private String username;
    private String email;
    private Long userId;
    private String message;

    public LoginResponse() {
    }

    public LoginResponse(String token, String username, String email, Long userId, String message) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.userId = userId;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
