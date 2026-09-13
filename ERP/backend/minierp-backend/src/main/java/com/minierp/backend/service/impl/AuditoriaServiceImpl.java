package com.minierp.backend.service.impl;

import com.minierp.backend.dto.auditoria.LogAuditoriaResponse;
import com.minierp.backend.entity.LogAuditoria;
import com.minierp.backend.entity.Usuario;
import com.minierp.backend.repository.LogAuditoriaRepository;
import com.minierp.backend.service.AuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditoriaServiceImpl implements AuditoriaService {

    private final LogAuditoriaRepository logRepository;

    /**
     * Usamos Propagation.REQUIRES_NEW para que la auditoría se guarde
     * incluso si la transacción principal hace rollback.
     *
     * ⚠️ MUY IMPORTANTE:
     * Si usáramos REQUIRED (por defecto), un fallo en el service principal
     * haría rollback también del log, y perderíamos la evidencia de la
     * operación que intentó hacerse. Por eso forzamos una transacción
     * independiente.
     */
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(Usuario usuario, String modulo, String tipoAccion, String detalle) {
        registrarConIp(usuario, modulo, tipoAccion, detalle, null);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarConIp(Usuario usuario, String modulo, String tipoAccion,
                               String detalle, String ipOrigen) {
        LogAuditoria log = LogAuditoria.builder()
                .usuario(usuario)
                .modulo(modulo)
                .tipoAccion(tipoAccion)
                .detalle(detalle)
                .ipOrigen(ipOrigen)
                .build();
        logRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LogAuditoriaResponse> buscar(LocalDateTime fechaDesde,
                                             LocalDateTime fechaHasta,
                                             Long usuarioId,
                                             String modulo,
                                             String tipoAccion,
                                             String texto) {
        return logRepository
                .filtrar(fechaDesde, fechaHasta, usuarioId, modulo, tipoAccion, texto)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private LogAuditoriaResponse toResponse(LogAuditoria log) {
        return new LogAuditoriaResponse(
                log.getId(),
                log.getUsuario().getId(),
                log.getUsuario().getNombre(),
                log.getFecha(),
                log.getModulo(),
                log.getTipoAccion(),
                log.getDetalle(),
                log.getIpOrigen()
        );
    }
}