package com.minierp.backend.exception;

import com.minierp.backend.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * Captura las excepciones que antes se escapaban como 500 y las convierte
 * en respuestas HTTP claras con un mensaje que el frontend puede mostrar
 * directamente al usuario.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Cubre BadCredentialsException (contraseña incorrecta) y
     * UsernameNotFoundException (usuario no existe): ambas extienden
     * AuthenticationException. A propósito devolvemos el MISMO mensaje
     * genérico para las dos, para no revelar si el correo existe o no
     * en el sistema (evita enumeración de usuarios).
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {

        ErrorResponse body = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                "Correo o contraseña incorrectos",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    /**
     * Usuario encontrado y contraseña correcta, pero cuenta desactivada
     * (activo = false en la base de datos).
     */
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponse> handleDisabledException(
            DisabledException ex, HttpServletRequest request) {

        ErrorResponse body = new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                "Forbidden",
                "Este usuario está desactivado. Contacta al administrador.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    /**
     * Se dispara cuando el @Valid de LoginRequest (u otro DTO) falla,
     * por ejemplo email o password vacíos.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ErrorResponse body = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                message.isBlank() ? "Datos inválidos" : message,
                request.getRequestURI()
        );
        return ResponseEntity.badRequest().body(body);
    }

    /**
     * Red de seguridad: cualquier otra excepción no controlada.
     * Nunca debería mostrarse el mensaje técnico crudo al usuario final.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {

        ErrorResponse body = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Ocurrió un error inesperado. Intenta de nuevo más tarde.",
                request.getRequestURI()
        );
        return ResponseEntity.internalServerError().body(body);
    }
}