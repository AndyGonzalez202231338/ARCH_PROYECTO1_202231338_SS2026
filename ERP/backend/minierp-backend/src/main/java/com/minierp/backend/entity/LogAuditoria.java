package com.minierp.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Representa la tabla "log_auditoria" de PostgreSQL.
 *
 * Registra las acciones relevantes realizadas por los usuarios
 * dentro del sistema: creación, actualización, eliminación,
 * consultas, cancelaciones, etc.
 *
 * El registro se hace desde los servicios del backend, nunca
 * desde el cliente. El campo usuario_id se obtiene del token JWT.
 *
 * Nota: no se define FK hacia ningún módulo específico porque
 * el log es transversal a todo el sistema; solo se guarda el
 * nombre del módulo como texto (PRODUCTOS, COMPRAS, VENTAS,
 * INVENTARIO, USUARIOS, etc.).
 */
@Entity
@Table(
    name = "log_auditoria",
    indexes = {
        @Index(name = "idx_log_auditoria_usuario", columnList = "usuario_id"),
        @Index(name = "idx_log_auditoria_fecha", columnList = "fecha"),
        @Index(name = "idx_log_auditoria_modulo", columnList = "modulo")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Usuario que realizó la acción.
     * Relación N:1 con Usuario. FK: usuario_id.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "usuario_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_log_auditoria_usuario")
    )
    private Usuario usuario;

    /**
     * Fecha y hora en que ocurrió la acción.
     * Se asigna automáticamente antes de persistir.
     */
    @Column(name = "fecha", nullable = false, updatable = false)
    private LocalDateTime fecha;

    /**
     * Módulo afectado por la acción.
     * Ej: PRODUCTOS, COMPRAS, VENTAS, INVENTARIO, USUARIOS.
     */
    @NotBlank
    @Size(max = 50)
    @Column(name = "modulo", nullable = false, length = 50)
    private String modulo;

    /**
     * Tipo de acción realizada.
     * Ej: CREAR, ACTUALIZAR, ELIMINAR, CONSULTAR, CANCELAR,
     * DESACTIVAR, RECIBIR, COMPLETAR.
     */
    @NotBlank
    @Size(max = 20)
    @Column(name = "tipo_accion", nullable = false, length = 20)
    private String tipoAccion;

    /**
     * Descripción detallada de la acción.
     * Ej: "Producto ID 5 actualizado: precio_venta 45000 -> 48000".
     * Se usa TEXT para permitir descripciones largas.
     */
    @Column(name = "detalle", columnDefinition = "TEXT")
    private String detalle;

    /**
     * Dirección IP del cliente que originó la acción.
     * Opcional; puede quedar nula si no se captura.
     */
    @Size(max = 45)
    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;

    // CALLBACKS JP

    @PrePersist
    public void prePersist() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof LogAuditoria)) return false;
        LogAuditoria that = (LogAuditoria) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}