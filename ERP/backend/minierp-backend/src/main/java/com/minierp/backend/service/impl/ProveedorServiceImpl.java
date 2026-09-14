package com.minierp.backend.service.impl;

import com.minierp.backend.dto.proveedor.ProveedorRequest;
import com.minierp.backend.dto.proveedor.ProveedorResponse;
import com.minierp.backend.entity.Proveedor;
import com.minierp.backend.exception.ConflictoException;
import com.minierp.backend.exception.RecursoNoEncontradoException;
import com.minierp.backend.exception.ReglaNegocioException;
import com.minierp.backend.repository.ProveedorRepository;
import com.minierp.backend.service.AuditoriaService;
import com.minierp.backend.service.ProveedorService;
import com.minierp.backend.util.UsuarioAutenticadoHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProveedorServiceImpl implements ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final AuditoriaService auditoriaService;
    private final UsuarioAutenticadoHelper usuarioActualHelper;

    private static final String MODULO = "PROVEEDORES";

    @Override
    @Transactional(readOnly = true)
    public List<ProveedorResponse> listar(Boolean activo, String texto) {
        String textoNorm = (texto == null || texto.isBlank()) ? "" : texto.trim();
        return proveedorRepository.filtrar(activo, textoNorm).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProveedorResponse obtener(Long id) {
        return toResponse(findOrFail(id));
    }

    @Override
    @Transactional
    public ProveedorResponse crear(ProveedorRequest request) {
        if (proveedorRepository.existsByNit(request.getNit())) {
            throw new ConflictoException(
                    "Ya existe un proveedor con el NIT: " + request.getNit());
        }

        Proveedor nuevo = Proveedor.builder()
                .nombre(request.getNombre())
                .nit(request.getNit())
                .telefono(request.getTelefono())
                .email(request.getEmail())
                .direccion(request.getDireccion())
                .activo(request.getActivo() == null || request.getActivo())
                .build();

        Proveedor guardado = proveedorRepository.save(nuevo);

        auditoriaService.registrar(usuarioActualHelper.getUsuarioActual(),
                MODULO, "CREAR",
                "Proveedor creado con id " + guardado.getId()
                        + " NIT " + guardado.getNit());

        return toResponse(guardado);
    }

    @Override
    @Transactional
    public ProveedorResponse actualizar(Long id, ProveedorRequest request) {
        Proveedor existente = findOrFail(id);

        if (!existente.getNit().equals(request.getNit())
                && proveedorRepository.existsByNit(request.getNit())) {
            throw new ConflictoException(
                    "Ya existe otro proveedor con el NIT: " + request.getNit());
        }

        existente.setNombre(request.getNombre());
        existente.setNit(request.getNit());
        existente.setTelefono(request.getTelefono());
        existente.setEmail(request.getEmail());
        existente.setDireccion(request.getDireccion());
        if (request.getActivo() != null) {
            existente.setActivo(request.getActivo());
        }

        Proveedor actualizado = proveedorRepository.save(existente);

        auditoriaService.registrar(usuarioActualHelper.getUsuarioActual(),
                MODULO, "ACTUALIZAR",
                "Proveedor actualizado con id " + id);

        return toResponse(actualizado);
    }

    @Override
    @Transactional
    public void desactivar(Long id) {
        Proveedor p = findOrFail(id);
        if (!Boolean.TRUE.equals(p.getActivo())) {
            throw new ReglaNegocioException("El proveedor ya está inactivo");
        }
        p.setActivo(false);
        proveedorRepository.save(p);

        auditoriaService.registrar(usuarioActualHelper.getUsuarioActual(),
                MODULO, "DESACTIVAR", "Proveedor desactivado con id " + id);
    }

    @Override
    @Transactional
    public void activar(Long id) {
        Proveedor p = findOrFail(id);
        if (Boolean.TRUE.equals(p.getActivo())) {
            throw new ReglaNegocioException("El proveedor ya está activo");
        }
        p.setActivo(true);
        proveedorRepository.save(p);

        auditoriaService.registrar(usuarioActualHelper.getUsuarioActual(),
                MODULO, "ACTIVAR", "Proveedor activado con id " + id);
    }

    private Proveedor findOrFail(Long id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Proveedor no encontrado con id: " + id));
    }

    private ProveedorResponse toResponse(Proveedor p) {
        return new ProveedorResponse(
                p.getId(), p.getNombre(), p.getNit(),
                p.getTelefono(), p.getEmail(), p.getDireccion(), p.getActivo());
    }
}