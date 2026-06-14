package com.sieuthi.demo.service.impl;

import com.sieuthi.demo.dto.response.NhaCungCapResponse;
import com.sieuthi.demo.repository.NhaCungCapRepository;
import com.sieuthi.demo.service.NhaCungCapService;
import org.springframework.stereotype.Service;
import java.sql.SQLException;
import java.util.List;

@Service
public class NhaCungCapServiceImpl implements NhaCungCapService {
    private final NhaCungCapRepository nhaCungCapRepository;

    public NhaCungCapServiceImpl(NhaCungCapRepository nhaCungCapRepository) {
        this.nhaCungCapRepository = nhaCungCapRepository;
    }

    @Override
    public List<NhaCungCapResponse> layTatCaNCC() {
        try {
            return nhaCungCapRepository.findAll();
        } catch (SQLException e) {
            throw new RuntimeException("Lỗi danh sách đối tác cung cấp: " + e.getMessage());
        }
    }
}