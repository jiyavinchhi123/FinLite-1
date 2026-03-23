import re

PAYMENT_MODES = ["cash", "bank", "upi", "card", "wallet"]
CATEGORIES = {
    "loan received": ["loan received", "loan from", "borrowed", "loan credit", "took loan"],
    "loan repayment": ["loan repayment", "loan repaid", "repay loan", "loan payment", "paid loan"],
    "loan given": ["loan given", "lent", "loan to", "gave loan"],
    "loan recovery": ["loan recovery", "recovered loan", "received loan back", "loan returned"],
    "machinery": ["machinery", "machine", "equipment purchase", "machine purchase"],
    "equipment": ["equipment", "device", "hardware"],
    "furniture": ["furniture", "fixtures", "chair", "table", "desk"],
    "land": ["land"],
    "building": ["building", "premises", "office purchase", "shop purchase"],
    "investments": ["investment", "invested", "shares", "mutual fund", "fd", "stock investment"],
    "rent": ["rent", "lease"],
    "salary": ["salary", "wages", "payroll"],
    "electricity": ["electricity", "power", "electric"],
    "purchase": ["purchase", "bought", "buy", "buying", "inventory", "stock", "raw material", "raw materials", "materials"],
    "sales": ["received", "receive", "sold", "sale", "selling", "income", "earned", "payment received"],
    "travel": ["travel", "fuel", "taxi", "bus"],
    "other": [],
}

INCOME_KEYWORDS = ["received", "receive", "got", "earned", "collected", "income", "payment received", "loan received", "loan recovery"]
EXPENSE_KEYWORDS = ["paid", "spent", "bought", "purchase", "purchased", "rent paid", "loan repayment", "loan given"]

def _extract_amount(text: str) -> float:
    matches = re.findall(r"[0-9]+(?:,[0-9]{3})*(?:\\.[0-9]{1,2})?|[0-9]+(?:\\.[0-9]{1,2})?", text)
    if not matches:
        return 0.0
    raw = max(matches, key=len).replace(",", "")
    try:
        return float(raw)
    except ValueError:
        return 0.0

def _extract_payment_mode(text: str) -> str:
    for mode in PAYMENT_MODES:
        if mode in text:
            return "UPI" if mode == "upi" else mode.capitalize()
    return "Cash"

def _extract_category(text: str) -> str:
    for category, keywords in CATEGORIES.items():
        if any(k in text for k in keywords):
            return category.capitalize()
    return "Other"

def _extract_counterparty(text: str) -> str:
    match = re.search(r"\bto\s+([a-z0-9&.\- ]+)$", text.strip())
    if match:
        return _clean_counterparty(match.group(1))
    match = re.search(r"\bfrom\s+([a-z0-9&.\- ]+)$", text.strip())
    if match:
        return _clean_counterparty(match.group(1))
    return ""

def _clean_counterparty(value: str) -> str:
    cleaned = re.sub(r"\b(pending|due)\b", "", value, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    return cleaned.strip().title()

def parse_smart_entry(text: str):
    lowered = text.lower()
    amount = _extract_amount(lowered)
    is_pending = "pending" in lowered or "due" in lowered
    payment_mode = "" if is_pending else _extract_payment_mode(lowered)
    category = _extract_category(lowered)
    counterparty = _extract_counterparty(lowered)
    has_income = any(k in lowered for k in INCOME_KEYWORDS)
    has_expense = any(k in lowered for k in EXPENSE_KEYWORDS)
    if has_income and not has_expense:
        entry_type = "income"
    elif has_expense and not has_income:
        entry_type = "expense"
    else:
        entry_type = "income" if category in ["Sales", "Loan Received", "Loan Recovery"] else "expense"
    currency = "INR" if ("₹" in text or "inr" in lowered or "rs" in lowered) else ""
    return {
        "amount": amount,
        "category": category,
        "payment_mode": payment_mode,
        "entry_type": entry_type,
        "currency": currency,
        "counterparty": counterparty,
        "pending": is_pending,
    }
