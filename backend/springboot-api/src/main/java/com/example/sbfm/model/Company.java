package com.example.sbfm.model;

import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.UUID;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "companies")
public class Company {
    @Id
    private UUID id;
    @Column(name = "owner_id")
    private UUID ownerId;
    private String name;
    private String businessType;
    private Double openingCash;
    private Double openingBank;
    private Double ownerCapital;
    private LocalDate fiscalStart;
    private OffsetDateTime createdAt;

    private Double goodwill;
    private Double patents;
    private Double businessPremises;
    private Double freeholdLand;
    private Double landAndBuilding;
    private Double plantAndMachinery;
    private Double furnitureAndFixtures;
    private Double investments;
    private Double looseTools;
    private Double closingStocks;
    private Double loanDebit;

    private Double mortgage;
    private Double loanCredit;
    private Double providentFund;
    private Double bankOverdraft;
    private Double billsPayable;
    private Double billsReceivable;
    private Double interestOnCapital;
    private Double interestOnCapitalRate;
    private Double incomeTaxRate;
    private Double drawings;
    private Double interestOnDrawings;
    private Double interestOnDrawingsRate;
    private LocalDate interestOnDrawingsDate;
    private Double incomeTax;
    private Double reservesAndSurplus;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getOwnerId() { return ownerId; }
    public void setOwnerId(UUID ownerId) { this.ownerId = ownerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBusinessType() { return businessType; }
    public void setBusinessType(String businessType) { this.businessType = businessType; }

    public Double getOpeningCash() { return openingCash; }
    public void setOpeningCash(Double openingCash) { this.openingCash = openingCash; }

    public Double getOpeningBank() { return openingBank; }
    public void setOpeningBank(Double openingBank) { this.openingBank = openingBank; }

    public Double getOwnerCapital() { return ownerCapital; }
    public void setOwnerCapital(Double ownerCapital) { this.ownerCapital = ownerCapital; }

    public LocalDate getFiscalStart() { return fiscalStart; }
    public void setFiscalStart(LocalDate fiscalStart) { this.fiscalStart = fiscalStart; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public Double getGoodwill() { return goodwill; }
    public void setGoodwill(Double goodwill) { this.goodwill = goodwill; }

    public Double getPatents() { return patents; }
    public void setPatents(Double patents) { this.patents = patents; }

    public Double getBusinessPremises() { return businessPremises; }
    public void setBusinessPremises(Double businessPremises) { this.businessPremises = businessPremises; }

    public Double getFreeholdLand() { return freeholdLand; }
    public void setFreeholdLand(Double freeholdLand) { this.freeholdLand = freeholdLand; }

    public Double getLandAndBuilding() { return landAndBuilding; }
    public void setLandAndBuilding(Double landAndBuilding) { this.landAndBuilding = landAndBuilding; }

    public Double getPlantAndMachinery() { return plantAndMachinery; }
    public void setPlantAndMachinery(Double plantAndMachinery) { this.plantAndMachinery = plantAndMachinery; }

    public Double getFurnitureAndFixtures() { return furnitureAndFixtures; }
    public void setFurnitureAndFixtures(Double furnitureAndFixtures) { this.furnitureAndFixtures = furnitureAndFixtures; }

    public Double getInvestments() { return investments; }
    public void setInvestments(Double investments) { this.investments = investments; }

    public Double getLooseTools() { return looseTools; }
    public void setLooseTools(Double looseTools) { this.looseTools = looseTools; }

    public Double getClosingStocks() { return closingStocks; }
    public void setClosingStocks(Double closingStocks) { this.closingStocks = closingStocks; }

    public Double getLoanDebit() { return loanDebit; }
    public void setLoanDebit(Double loanDebit) { this.loanDebit = loanDebit; }

    public Double getMortgage() { return mortgage; }
    public void setMortgage(Double mortgage) { this.mortgage = mortgage; }

    public Double getLoanCredit() { return loanCredit; }
    public void setLoanCredit(Double loanCredit) { this.loanCredit = loanCredit; }

    public Double getProvidentFund() { return providentFund; }
    public void setProvidentFund(Double providentFund) { this.providentFund = providentFund; }

    public Double getBankOverdraft() { return bankOverdraft; }
    public void setBankOverdraft(Double bankOverdraft) { this.bankOverdraft = bankOverdraft; }

    public Double getBillsPayable() { return billsPayable; }
    public void setBillsPayable(Double billsPayable) { this.billsPayable = billsPayable; }

    public Double getBillsReceivable() { return billsReceivable; }
    public void setBillsReceivable(Double billsReceivable) { this.billsReceivable = billsReceivable; }

    public Double getInterestOnCapital() { return interestOnCapital; }
    public void setInterestOnCapital(Double interestOnCapital) { this.interestOnCapital = interestOnCapital; }

    public Double getInterestOnCapitalRate() { return interestOnCapitalRate; }
    public void setInterestOnCapitalRate(Double interestOnCapitalRate) { this.interestOnCapitalRate = interestOnCapitalRate; }

    public Double getIncomeTaxRate() { return incomeTaxRate; }
    public void setIncomeTaxRate(Double incomeTaxRate) { this.incomeTaxRate = incomeTaxRate; }

    public Double getDrawings() { return drawings; }
    public void setDrawings(Double drawings) { this.drawings = drawings; }

    public Double getInterestOnDrawings() { return interestOnDrawings; }
    public void setInterestOnDrawings(Double interestOnDrawings) { this.interestOnDrawings = interestOnDrawings; }

    public Double getInterestOnDrawingsRate() { return interestOnDrawingsRate; }
    public void setInterestOnDrawingsRate(Double interestOnDrawingsRate) { this.interestOnDrawingsRate = interestOnDrawingsRate; }

    public LocalDate getInterestOnDrawingsDate() { return interestOnDrawingsDate; }
    public void setInterestOnDrawingsDate(LocalDate interestOnDrawingsDate) { this.interestOnDrawingsDate = interestOnDrawingsDate; }

    public Double getIncomeTax() { return incomeTax; }
    public void setIncomeTax(Double incomeTax) { this.incomeTax = incomeTax; }

    public Double getReservesAndSurplus() { return reservesAndSurplus; }
    public void setReservesAndSurplus(Double reservesAndSurplus) { this.reservesAndSurplus = reservesAndSurplus; }
}
