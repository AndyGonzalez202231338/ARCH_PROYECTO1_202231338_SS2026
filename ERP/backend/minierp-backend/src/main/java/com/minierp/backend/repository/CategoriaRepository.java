package com.minierp.backend.repository;

import com.minierp.backend.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findByNombre(String nombre);

    boolean existsByNombre(String nombre);

    boolean existsByProductosIsNotEmpty(Long categoriaId);
}