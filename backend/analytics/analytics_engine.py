import sys
import json
import numpy as np
import pandas as pd
from datetime import datetime

def analyze_financial_data(transactions_json, budgets_json):
    """
    Performs comprehensive data analytics on transaction and budget data.
    Uses pandas and numpy for statistical processing, anomaly detection, and insights generation.
    """
    if not transactions_json:
        return {
            "summary": {
                "total_income": 0,
                "total_expenses": 0,
                "net_savings": 0,
                "savings_rate": 0,
                "avg_monthly_expense": 0,
                "avg_daily_expense": 0,
                "transaction_count": 0
            },
            "category_breakdown": [],
            "monthly_trends": [],
            "unusual_spending": [],
            "smart_insights": ["No transactions recorded yet. Add your income and expenses to unlock data analytics!"]
        }

    df = pd.DataFrame(transactions_json)
    
    # Ensure proper data types
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df['type'] = df['type'].str.lower()
    df['category'] = df['category'].fillna('Other')

    # Remove invalid dates
    df = df.dropna(subset=['date'])

    if df.empty:
        return {
            "summary": {
                "total_income": 0,
                "total_expenses": 0,
                "net_savings": 0,
                "savings_rate": 0,
                "avg_monthly_expense": 0,
                "avg_daily_expense": 0,
                "transaction_count": 0
            },
            "category_breakdown": [],
            "monthly_trends": [],
            "unusual_spending": [],
            "smart_insights": ["No valid transaction records found."]
        }

    # Extract Year-Month and Month Name
    df['year_month'] = df['date'].dt.strftime('%Y-%m')
    df['month_name'] = df['date'].dt.strftime('%b %Y')
    df['day'] = df['date'].dt.date

    # Income vs Expense split
    income_df = df[df['type'] == 'income']
    expense_df = df[df['type'] == 'expense']

    total_income = float(income_df['amount'].sum())
    total_expenses = float(expense_df['amount'].sum())
    net_savings = total_income - total_expenses
    savings_rate = float((net_savings / total_income * 100)) if total_income > 0 else 0.0

    # Date range statistics
    num_days = max(1, (df['date'].max() - df['date'].min()).days + 1)
    num_months = max(1, len(df['year_month'].unique()))

    avg_monthly_expense = float(total_expenses / num_months)
    avg_daily_expense = float(total_expenses / num_days)

    # Category Breakdown for Expenses
    category_summary = []
    if not expense_df.empty:
        cat_grouped = expense_df.groupby('category')['amount'].sum().reset_index()
        cat_grouped['percentage'] = (cat_grouped['amount'] / total_expenses * 100).round(2)
        cat_grouped = cat_grouped.sort_values(by='amount', ascending=False)
        
        for _, row in cat_grouped.iterrows():
            category_summary.append({
                "category": row['category'],
                "amount": float(row['amount']),
                "percentage": float(row['percentage'])
            })

    # Monthly Trends (Income, Expense, Savings)
    monthly_trends = []
    all_months = sorted(df['year_month'].unique())
    for ym in all_months:
        m_inc = float(income_df[income_df['year_month'] == ym]['amount'].sum())
        m_exp = float(expense_df[expense_df['year_month'] == ym]['amount'].sum())
        m_sav = m_inc - m_exp
        month_label = pd.to_datetime(ym + '-01').strftime('%b %Y')
        monthly_trends.append({
            "month_key": ym,
            "month": month_label,
            "income": m_inc,
            "expenses": m_exp,
            "savings": m_sav
        })

    # Statistical Anomaly / Unusual Spending Detection
    unusual_spending = []
    if not expense_df.empty and len(expense_df) >= 3:
        # 1. Z-score anomaly on expense amounts within category
        for cat, cat_df in expense_df.groupby('category'):
            if len(cat_df) >= 3:
                mean_val = cat_df['amount'].mean()
                std_val = cat_df['amount'].std()
                if std_val > 0:
                    cat_df['z_score'] = (cat_df['amount'] - mean_val) / std_val
                    outliers = cat_df[cat_df['z_score'] >= 2.0]
                    for _, row in outliers.iterrows():
                        unusual_spending.append({
                            "id": str(row.get('id', '')),
                            "date": row['date'].strftime('%Y-%m-%d'),
                            "category": row['category'],
                            "amount": float(row['amount']),
                            "description": row.get('description', ''),
                            "type": "spike_transaction",
                            "severity": "High" if row['z_score'] >= 2.5 else "Medium",
                            "reason": f"Transaction of ${row['amount']:.2f} is unusually higher than category average (${mean_val:.2f})."
                        })

        # 2. Month-over-Month Category Sudden Increase (> 40% jump)
        if len(all_months) >= 2:
            last_month = all_months[-1]
            prev_month = all_months[-2]
            
            curr_m_exp = expense_df[expense_df['year_month'] == last_month].groupby('category')['amount'].sum()
            prev_m_exp = expense_df[expense_df['year_month'] == prev_month].groupby('category')['amount'].sum()

            for cat in curr_m_exp.index:
                curr_amt = curr_m_exp.get(cat, 0)
                prev_amt = prev_m_exp.get(cat, 0)
                if prev_amt > 50 and curr_amt > prev_amt * 1.4:
                    pct_increase = ((curr_amt - prev_amt) / prev_amt) * 100
                    unusual_spending.append({
                        "category": cat,
                        "amount": float(curr_amt),
                        "type": "category_surge",
                        "severity": "Medium",
                        "reason": f"Spending in '{cat}' jumped by {pct_increase:.1f}% this month compared to last month (${prev_amt:.2f} vs ${curr_amt:.2f})."
                    })

    # Smart Insights Generation
    smart_insights = []

    # Highest expense category insight
    if category_summary:
        top_cat = category_summary[0]
        smart_insights.append(
            f"🎯 Top Expense Driver: '{top_cat['category']}' accounts for {top_cat['percentage']}% of total expenses (${top_cat['amount']:,.2f})."
        )

    # Savings behavior insight
    if savings_rate >= 20:
        smart_insights.append(
            f"💪 Strong Savings Rate: You are saving {savings_rate:.1f}% of your income! Keep up the momentum."
        )
    elif savings_rate > 0:
        smart_insights.append(
            f"💡 Savings Opportunity: Your savings rate is {savings_rate:.1f}%. Aiming for 20% can build a robust emergency buffer."
        )
    else:
        smart_insights.append(
            f"⚠️ Deficit Alert: Expenses exceed total income by ${abs(net_savings):,.2f}. Review non-essential categories."
        )

    # Trend comparison insight
    if len(monthly_trends) >= 2:
        curr_m = monthly_trends[-1]
        prev_m = monthly_trends[-2]
        if prev_m['expenses'] > 0:
            exp_change = ((curr_m['expenses'] - prev_m['expenses']) / prev_m['expenses']) * 100
            if exp_change > 0:
                smart_insights.append(
                    f"📈 Monthly Trend: Expenses increased by {exp_change:.1f}% in {curr_m['month']} compared to {prev_m['month']}."
                )
            else:
                smart_insights.append(
                    f"📉 Spending Cutback: Monthly expenses decreased by {abs(exp_change):.1f}% in {curr_m['month']} compared to {prev_m['month']}."
                )

    # Unusual spending insight alert count
    if len(unusual_spending) > 0:
        smart_insights.append(
            f"⚡ Anomaly Detected: {len(unusual_spending)} unusual transaction(s) or category spikes flagged for review."
        )

    return {
        "summary": {
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "net_savings": round(net_savings, 2),
            "savings_rate": round(savings_rate, 2),
            "avg_monthly_expense": round(avg_monthly_expense, 2),
            "avg_daily_expense": round(avg_daily_expense, 2),
            "transaction_count": len(df)
        },
        "category_breakdown": category_summary,
        "monthly_trends": monthly_trends,
        "unusual_spending": unusual_spending,
        "smart_insights": smart_insights
    }

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            input_file = sys.argv[1]
            with open(input_file, 'r') as f:
                data = json.load(f)
            txs = data.get('transactions', [])
            budgets = data.get('budgets', [])
        else:
            input_data = sys.stdin.read()
            if input_data:
                data = json.loads(input_data)
                txs = data.get('transactions', [])
                budgets = data.get('budgets', [])
            else:
                txs = []
                budgets = []
        
        result = analyze_financial_data(txs, budgets)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e), "smart_insights": ["Error processing analytics."]}), sys.stderr)
