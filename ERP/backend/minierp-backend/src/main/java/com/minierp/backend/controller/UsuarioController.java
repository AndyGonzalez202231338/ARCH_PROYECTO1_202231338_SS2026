package com.minierp.backend.controller;

import com.minierp.backend.dto.auth.UsuarioMeResponse;
import com.minierp.backend.entity.Usuario;
import com.minierp.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    @GetMapping("/me")
    public UsuarioMeResponse me(@AuthenticationPrincipal UserDetails principal) {

        Usuario usuario = usuarioRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        String rol = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_USER")
                .replace("ROLE_", "");

        return new UsuarioMeResponse(usuario.getNombre(), usuario.getEmail(), rol);
    }
}