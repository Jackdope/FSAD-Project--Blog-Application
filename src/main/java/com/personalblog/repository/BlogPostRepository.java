package com.personalblog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.personalblog.entity.BlogPost;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    List<BlogPost> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
    List<BlogPost> findAllByOrderByCreatedAtDesc();
    List<BlogPost> findByIsPublicTrueOrderByCreatedAtDesc();
    List<BlogPost> findByAuthorIdAndIsPublicTrueOrderByCreatedAtDesc(Long authorId);
    List<BlogPost> findByTagsContainingIgnoreCaseAndIsPublicTrueOrderByCreatedAtDesc(String tag);
}
