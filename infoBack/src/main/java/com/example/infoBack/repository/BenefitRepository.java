package com.example.infoBack.repository;

import com.example.infoBack.entity.Benefit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BenefitRepository extends JpaRepository<Benefit, Long> {
    Optional<Benefit> findByExternalId(String externalId);
    List<Benefit> findAllByExternalIdIn(Collection<String> externalIds);
    boolean existsBySource(String source);

    @Query("SELECT COALESCE(b.category, '기타'), COUNT(b) FROM Benefit b GROUP BY COALESCE(b.category, '기타')")
    List<Object[]> countByCategory();
}
