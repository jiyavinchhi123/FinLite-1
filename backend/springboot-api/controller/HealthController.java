package com.example.sbfm.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/summary")
    public String summary() {
        return "{\"businessMoney\":24500,\"moneyIn\":12900,\"moneyOut\":7400,\"pendingPayments\":3150}";
    }
}
