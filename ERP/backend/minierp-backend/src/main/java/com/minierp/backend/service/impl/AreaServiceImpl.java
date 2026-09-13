package com.minierp.backend.service.impl;

import com.minierp.backend.dto.area.AreaResponse;
import com.minierp.backend.repository.AreaRepository;
import com.minierp.backend.service.AreaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AreaServiceImpl implements AreaService {

    private final AreaRepository areaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AreaResponse> listarTodas() {
        return areaRepository.findAll().stream()
                .map(a -> new AreaResponse(a.getId(), a.getNombre(), a.getDescripcion()))
                .toList();
    }
}