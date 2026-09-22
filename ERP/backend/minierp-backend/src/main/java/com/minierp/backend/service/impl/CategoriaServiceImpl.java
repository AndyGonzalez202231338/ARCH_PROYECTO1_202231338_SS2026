package com.minierp.backend.service.impl;

import com.minierp.backend.dto.categoria.CategoriaRequest;
import com.minierp.backend.dto.categoria.CategoriaResponse;
import com.minierp.backend.entity.Categoria;
import com.minierp.backend.exception.ConflictoException;
import com.minierp.backend.exception.RecursoNoEncontradoException;
import com.minierp.backend.exception.ReglaNegocioException;
import com.minierp.backend.repository.CategoriaRepository;
import com.minierp.backend.repository.ProductoRepository;
import com.minierp.backend.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return categoriaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoriaResponse obtener(Long id) {
        Categoria c = categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Categoría no encontrada con id: " + id));
        return toResponse(c);
    }

    @Override
    @Transactional
    public CategoriaResponse crear(CategoriaRequest request) {
        if (categoriaRepository.existsByNombre(request.getNombre())) {
            throw new ConflictoException(
                    "Ya existe una categoría con el nombre: " + request.getNombre());
        }
        Categoria nueva = Categoria.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .build();
        return toResponse(categoriaRepository.save(nueva));
    }

    @Override
    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaRequest request) {
        Categoria existente = categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Categoría no encontrada con id: " + id));

        // Validar duplicado solo si cambia el nombre
        if (!existente.getNombre().equalsIgnoreCase(request.getNombre())
                && categoriaRepository.existsByNombre(request.getNombre())) {
            throw new ConflictoException(
                    "Ya existe otra categoría con el nombre: " + request.getNombre());
        }

        existente.setNombre(request.getNombre());
        existente.setDescripcion(request.getDescripcion());
        return toResponse(categoriaRepository.save(existente));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RecursoNoEncontradoException(
                    "Categoría no encontrada con id: " + id);
        }

        if (productoRepository.existsByCategoriaId(id)) {
            throw new ReglaNegocioException(
                "No se puede eliminar la categoría porque tiene productos asociados");
        }
        // Regla de negocio: no eliminar si tiene productos asociados.
        
        categoriaRepository.deleteById(id);
    }

    private CategoriaResponse toResponse(Categoria c) {
        return new CategoriaResponse(c.getId(), c.getNombre(), c.getDescripcion());
    }
}