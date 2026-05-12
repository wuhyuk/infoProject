package com.example.infoBack.repository;

import com.example.infoBack.entity.Benefit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BenefitRepository extends JpaRepository<Benefit, Long> {
    Optional<Benefit> findByExternalId(String externalId);
    List<Benefit> findAllByExternalIdIn(Collection<String> externalIds);
}
