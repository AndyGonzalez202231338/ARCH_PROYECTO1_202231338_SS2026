package com.minierp.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "areas")
@Getter
@NoArgsConstructor
public class Area {
    @Id
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String nombre;
}