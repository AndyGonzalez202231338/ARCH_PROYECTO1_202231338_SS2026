package com.minierp.backend.service.impl;

import com.minierp.backend.dto.cliente.ClienteRequest;
import com.minierp.backend.dto.cliente.ClienteResponse;
import com.minierp.backend.entity.Cliente;
import com.minierp.backend.exception.ConflictoException;
import com.minierp.backend.exception.RecursoNoEncontradoException;
import com.minierp.backend.exception.ReglaNegocioException;
import com.minierp.backend.repository.ClienteRepository;
import com.minierp.backend.service.AuditoriaService;
import com.minierp.backend.service.ClienteService;
import com.minierp.backend.util.UsuarioAutenticadoHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final AuditoriaService auditoriaService;
    private final UsuarioAutenticadoHelper usuarioActualHelper;

    private static final String MODULO = "CLIENTES";

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponse> listar(Boolean activo, String texto) {
        return clienteRepository.filtrar(activo, texto).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponse obtener(Long id) {
        return toResponse(findOrFail(id));
    }

    @Override
    @Transactional
    public ClienteResponse crear(ClienteRequest request) {
        if (clienteRepository.existsByNumeroDocumento(request.getNumeroDocumento())) {
            throw new ConflictoException(
                    "Ya existe un cliente con el documento: " + request.getNumeroDocumento());
        }
        Cliente nuevo = Cliente.builder()
                .nombre(request.getNombre())
                .tipoDocumento(request.getTipoDocumento())
                .numeroDocumento(request.getNumeroDocumento())
                .telefono(request.getTelefono())
                .email(request.getEmail())
                .direccion(request.getDireccion())
                .activo(request.getActivo() == null || request.getActivo())
                .build();

        Cliente guardado = clienteRepository.save(nuevo);

        auditoriaService.registrar(usuarioActualHelper.getUsuarioActual(),
                MODULO, "CREAR",
                "Cliente creado con id " + guardado.getId()
                        + " documento " + guardado.getNumeroDocumento());

        return toResponse(guardado);
    }

    @Override
    @Transactional
    public ClienteResponse actualizar(Long id, ClienteRequest request) {
        Cliente existente = findOrFail(id);

        if (!existente.getNumeroDocumento().equals(request.getNumeroDocumento())
                && clienteRepository.existsByNumeroDocumento(request.getNumeroDocumento())) {
            throw new ConflictoException(
                    "Ya existe otro cliente con el documento: " + request.getNumeroDocumento());
        }

        existente.setNombre(request.getNombre());
        existente.setTipoDocumento(request.getTipoDocumento());
        existente.setNumeroDocumento(request.getNumeroDocumento());
        existente.setTelefono(request.getTelefono());
        existente.setEmail(request.getEmail());
        existente.setDireccion(request.getDireccion());
        if (request.getActivo() != null) {
            existente.setActivo(request.getActivo());
        }

        Cliente actualizado = clienteRepository.save(existente);

        auditoriaService.registrar(usuarioActualHelper.getUsuarioActual(),
                MODULO, "ACTUALIZAR", "Cliente actualizado con id " + id);

        return toResponse(actualizado);
    }

    @Override
    @Transactional
    public void desactivar(Long id) {
        Cliente c = findOrFail(id);
        if (!Boolean.TRUE.equals(c.getActivo())) {
            throw new ReglaNegocioException("El cliente ya está inactivo");
        }
        c.setActivo(false);
        clienteRepository.save(c);

        auditoriaService.registrar(usuarioActualHelper.getUsuarioActual(),
                MODULO, "DESACTIVAR", "Cliente desactivado con id " + id);
    }

    @Override
    @Transactional
    public void activar(Long id) {
        Cliente c = findOrFail(id);
        if (Boolean.TRUE.equals(c.getActivo())) {
            throw new ReglaNegocioException("El cliente ya está activo");
        }
        c.setActivo(true);
        clienteRepository.save(c);

        auditoriaService.registrar(usuarioActualHelper.getUsuarioActual(),
                MODULO, "ACTIVAR", "Cliente activado con id " + id);
    }

    private Cliente findOrFail(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Cliente no encontrado con id: " + id));
    }

    private ClienteResponse toResponse(Cliente c) {
        return new ClienteResponse(
                c.getId(), c.getNombre(), c.getTipoDocumento(),
                c.getNumeroDocumento(), c.getTelefono(), c.getEmail(),
                c.getDireccion(), c.getActivo(), c.getCreatedAt());
    }
}