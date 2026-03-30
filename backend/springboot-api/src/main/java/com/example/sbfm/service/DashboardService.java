package com.example.sbfm.service;

import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("businessMoney", 24500);
        summary.put("moneyIn", 12900);
        summary.put("moneyOut", 7400);
        summary.put("pendingPayments", 3150);
        summary.put("aiMessage", "Your business is growing");
        return summary;
    }
}
