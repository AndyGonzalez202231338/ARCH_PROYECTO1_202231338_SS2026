package com.minierp.backend.service.impl;

import com.minierp.backend.dto.producto.ProductoRequest;
import com.minierp.backend.dto.producto.ProductoResponse;
import com.minierp.backend.entity.Categoria;
import com.minierp.backend.entity.Producto;
import com.minierp.backend.exception.ConflictoException;
import com.minierp.backend.exception.RecursoNoEncontradoException;
import com.minierp.backend.exception.ReglaNegocioException;
import com.minierp.backend.repository.CategoriaRepository;
import com.minierp.backend.repository.ProductoRepository;
import com.minierp.backend.service.AuditoriaService;
import com.minierp.backend.service.ProductoService;
import com.minierp.backend.util.UsuarioAutenticadoHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final AuditoriaService auditoriaService;
    private final UsuarioAutenticadoHelper usuarioActualHelper;

    private static final String MODULO = "PRODUCTOS";

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponse> listar(Long categoriaId, Boolean activo, String texto) {
        return productoRepository.filtrar(categoriaId, activo, texto).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoResponse obtener(Long id) {
        return toResponse(findOrFail(id));
    }

    @Override
    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        if (productoRepository.existsByCodigo(request.getCodigo())) {
            throw new ConflictoException(
                    "Ya existe un producto con el código: " + request.getCodigo());
        }

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Categoría no encontrada con id: " + request.getCategoriaId()));

        Producto nuevo = Producto.builder()
                .codigo(request.getCodigo())
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .categoria(categoria)
                .precioCompra(request.getPrecioCompra())
                .precioVenta(request.getPrecioVenta())
                .unidadMedida(request.getUnidadMedida())
                .stockActual(0)                       // ⚠️ siempre inicia en 0
                .stockMinimo(request.getStockMinimo())
                .activo(request.getActivo() == null || request.getActivo())
                .build();

        Producto guardado = productoRepository.save(nuevo);

        auditoriaService.registrar(usuarioActualHelper.getUsuarioActual(),
                MODULO, "CREAR",
                "Producto creado con id " + guardado.getId()
                        + " código " + guardado.getCodigo());

        return toResponse(guardado);
    }

    @Override
    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Producto existente = findOrFail(id);

        if (!existente.getCodigo().equalsIgnoreCase(request.getCodigo())
                && productoRepository.existsByCodigo(request.getCodigo())) {
            throw new ConflictoException(
                    "Ya existe otro producto con el código: " + request.getCodigo());
        }

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Categoría no encontrada con id: " + request.getCategoriaId()));

        existente.setCodigo(request.getCodigo());
        existente.setNombre(request.getNombre());
        existente.setDescripcion(request.getDescripcion());
        existente.setCategoria(categoria);
        existente.setPrecioCompra(request.getPrecioCompra());
        existente.setPrecioVenta(request.getPrecioVenta());
        existente.setUnidadMedida(request.getUnidadMedida());
        existente.setStockMinimo(request.getStockMinimo());
        // stockActual NO se toca aquí.
        // Solo se modifica desde movimientos de inventario.
        if (request.getActivo() != null) {
            existente.setActivo(request.getActivo());
        }

        Producto actualizado = productoRepository.save(existente);

        auditoriaService.registrar(usuarioActualHelper.getUsuarioActual(),
                MODULO, "ACTUALIZAR", "Producto actualizado con id " + id);

        return toResponse(actualizado);
    }

    @Override
    @Transactional
    public void desactivar(Long id) {
        Producto p = findOrFail(id);
        if (!Boolean.TRUE.equals(p.getActivo())) {
            throw new ReglaNegocioException("El producto ya está inactivo");
        }
        p.setActivo(false);
        productoRepository.save(p);

        auditoriaService.registrar(usuarioActualHelper.getUsuarioActual(),
                MODULO, "DESACTIVAR", "Producto desactivado con id " + id);
    }

    @Override
    @Transactional
    public void activar(Long id) {
        Producto p = findOrFail(id);
        if (Boolean.TRUE.equals(p.getActivo())) {
            throw new ReglaNegocioException("El producto ya está activo");
        }
        p.setActivo(true);
        productoRepository.save(p);

        auditoriaService.registrar(usuarioActualHelper.getUsuarioActual(),
                MODULO, "ACTIVAR", "Producto activado con id " + id);
    }

    private Producto findOrFail(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Producto no encontrado con id: " + id));
    }

    private ProductoResponse toResponse(Producto p) {
        return ProductoResponse.builder()
                .id(p.getId())
                .codigo(p.getCodigo())
                .nombre(p.getNombre())
                .descripcion(p.getDescripcion())
                .categoriaId(p.getCategoria().getId())
                .categoriaNombre(p.getCategoria().getNombre())
                .precioCompra(p.getPrecioCompra())
                .precioVenta(p.getPrecioVenta())
                .unidadMedida(p.getUnidadMedida())
                .stockActual(p.getStockActual())
                .stockMinimo(p.getStockMinimo())
                .activo(p.getActivo())
                .bajoStock(p.tieneBajoStock())
                .build();
    }
}