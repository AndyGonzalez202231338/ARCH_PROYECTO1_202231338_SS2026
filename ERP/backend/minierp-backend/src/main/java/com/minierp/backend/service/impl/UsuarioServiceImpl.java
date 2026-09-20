package com.minierp.backend.service.impl;

import com.minierp.backend.dto.usuario.UsuarioRequest;
import com.minierp.backend.dto.usuario.UsuarioResponse;
import com.minierp.backend.entity.Area;
import com.minierp.backend.entity.Usuario;
import com.minierp.backend.exception.ConflictoException;
import com.minierp.backend.exception.RecursoNoEncontradoException;
import com.minierp.backend.exception.ReglaNegocioException;
import com.minierp.backend.repository.AreaRepository;
import com.minierp.backend.repository.UsuarioRepository;
import com.minierp.backend.service.AuditoriaService;
import com.minierp.backend.service.UsuarioService;
import com.minierp.backend.util.UsuarioAutenticadoHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final AreaRepository areaRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditoriaService auditoriaService;
    private final UsuarioAutenticadoHelper usuarioActualHelper;

    private static final String MODULO = "USUARIOS";

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar(Long areaId, Boolean activo, String texto) {
        // Nota: el texto libre no lo filtramos aquí por simplicidad.
        // Si quieres, puedes añadir un método en el repositorio.
        return usuarioRepository.filtrar(areaId, activo).stream()
                .filter(u -> texto == null || texto.isBlank()
                        || u.getNombre().toLowerCase().contains(texto.toLowerCase())
                        || u.getEmail().toLowerCase().contains(texto.toLowerCase()))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Usuario no encontrado con id: " + id));
        return toResponse(u);
    }

    @Override
    @Transactional
    public UsuarioResponse crear(UsuarioRequest request) {
        // Validar email único
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ConflictoException(
                    "Ya existe un usuario con el email: " + request.getEmail());
        }

        // Validar que el área exista
        Area area = areaRepository.findById(request.getAreaId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Área no encontrada con id: " + request.getAreaId()));

        // Validar contraseña obligatoria en creación
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ReglaNegocioException(
                    "La contraseña es obligatoria al crear un usuario");
        }

        // Crear el usuario
        Usuario nuevo = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .area(area)
                .activo(request.getActivo() == null || request.getActivo())
                .build();

        Usuario guardado = usuarioRepository.save(nuevo);

        // Auditar
        Usuario actor = usuarioActualHelper.getUsuarioActual();
        auditoriaService.registrar(actor, MODULO, "CREAR",
                "Usuario creado con id " + guardado.getId()
                        + " y email " + guardado.getEmail());

        return toResponse(guardado);
    }

    @Override
    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioRequest request) {
        Usuario existente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Usuario no encontrado con id: " + id));

        // Validar email único si cambió
        if (!existente.getEmail().equalsIgnoreCase(request.getEmail())
                && usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ConflictoException(
                    "Ya existe otro usuario con el email: " + request.getEmail());
        }

        // Validar área
        Area area = areaRepository.findById(request.getAreaId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Área no encontrada con id: " + request.getAreaId()));

        // Actualizar campos (NO se toca la contraseña aquí)
        existente.setNombre(request.getNombre());
        existente.setEmail(request.getEmail());
        existente.setArea(area);
        if (request.getActivo() != null) {
            existente.setActivo(request.getActivo());
        }

        Usuario actualizado = usuarioRepository.save(existente);

        // Auditar
        Usuario actor = usuarioActualHelper.getUsuarioActual();
        auditoriaService.registrar(actor, MODULO, "ACTUALIZAR",
                "Usuario actualizado con id " + actualizado.getId());

        return toResponse(actualizado);
    }

    @Override
    @Transactional
    public void cambiarPassword(Long id, String nuevaPassword) {
        if (nuevaPassword == null || nuevaPassword.length() < 6) {
            throw new ReglaNegocioException(
                    "La nueva contraseña debe tener al menos 6 caracteres");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Usuario no encontrado con id: " + id));

        usuario.setPasswordHash(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);

        Usuario actor = usuarioActualHelper.getUsuarioActual();
        auditoriaService.registrar(actor, MODULO, "CAMBIO_PASSWORD",
                "Contraseña cambiada para el usuario id " + id);
    }

    @Override
    @Transactional
    public void activar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Usuario no encontrado con id: " + id));

        if (Boolean.TRUE.equals(usuario.getActivo())) {
            throw new ReglaNegocioException("El usuario ya está activo");
        }

        usuario.setActivo(true);
        usuarioRepository.save(usuario);

        Usuario actor = usuarioActualHelper.getUsuarioActual();
        auditoriaService.registrar(actor, MODULO, "ACTIVAR",
                "Usuario activado con id " + id);
    }

    @Override
    @Transactional
    public void desactivar(Long id, Long usuarioActualId) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Usuario no encontrado con id: " + id));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new ReglaNegocioException("El usuario ya está inactivo");
        }

        // Regla 1: no puede desactivarse a sí mismo
        if (usuario.getId().equals(usuarioActualId)) {
            throw new ReglaNegocioException(
                    "No puedes desactivar tu propio usuario");
        }

        // Regla 2: no se puede desactivar al último administrador activo
        if ("ADMINISTRACION".equalsIgnoreCase(usuario.getArea().getNombre())
                && usuarioRepository.contarAdminsActivos() <= 1) {
            throw new ReglaNegocioException(
                    "No se puede desactivar al último administrador activo del sistema");
        }

        usuario.setActivo(false);
        usuarioRepository.save(usuario);

        Usuario actor = usuarioActualHelper.getUsuarioActual();
        auditoriaService.registrar(actor, MODULO, "DESACTIVAR",
                "Usuario desactivado con id " + id);
    }

    private UsuarioResponse toResponse(Usuario u) {
        return UsuarioResponse.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .email(u.getEmail())
                .areaId(u.getArea().getId())
                .areaNombre(u.getArea().getNombre())
                .activo(u.getActivo())
                .build();
    }
}