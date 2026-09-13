package com.minierp.backend.repository;

import com.minierp.backend.entity.Area;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AreaRepository extends JpaRepository<Area, Long> {

    Optional<Area> findByNombre(String nombre);

    boolean existsByNombre(String nombre);
}