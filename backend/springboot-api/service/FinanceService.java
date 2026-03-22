package com.example.sbfm.service;

import org.springframework.stereotype.Service;

@Service
public class FinanceService {
    public String getSummary() {
        return "{\"businessMoney\":24500,\"moneyIn\":12900,\"moneyOut\":7400,\"pendingPayments\":3150}";
    }
}
