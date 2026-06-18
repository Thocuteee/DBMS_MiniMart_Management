package com.sieuthi.demo.controller;

import com.sieuthi.demo.dto.response.TonKhoResponse;
import com.sieuthi.demo.service.TonKhoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ton-kho")
@CrossOrigin("*")
public class TonKhoController {

    private final TonKhoService tonKhoService;

    public TonKhoController(TonKhoService tonKhoService) {
        this.tonKhoService = tonKhoService;
    }

    @GetMapping
    public ResponseEntity<List<TonKhoResponse>> layTatCa() {
        return ResponseEntity.ok(tonKhoService.layTatCaTonKho());
    }

    @GetMapping("/kho/{maKho}")
    public ResponseEntity<List<TonKhoResponse>> xemTonTheoMaKho(@PathVariable String maKho) {
        return ResponseEntity.ok(tonKhoService.xemTonKhoTheoKho(maKho));
    }
}