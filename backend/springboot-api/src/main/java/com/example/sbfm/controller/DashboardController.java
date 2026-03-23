package com.example.sbfm.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.sbfm.service.DashboardService;

@RestController
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping({"/dashboard", "/api/dashboard", "/api/summary"})
    public Map<String, Object> summary() {
        return dashboardService.getSummary();
    }
}
