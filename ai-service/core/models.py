import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime,
    Text, DECIMAL, ForeignKey, ARRAY, JSON,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    email = Column(String(255), nullable=True)
    password_hash = Column(Text, nullable=False)
    role = Column(ARRAY(Text), default=[])
    state = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    latitude = Column(DECIMAL(9, 6), nullable=True)
    longitude = Column(DECIMAL(9, 6), nullable=True)
    squad_customer_id = Column(String(255), nullable=True)
    virtual_account_no = Column(String(50), nullable=True)
    languages = Column(ARRAY(Text), default=[])
    is_verified = Column(Boolean, default=False)
    onboarding_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    economic_profile = relationship("EconomicProfile", back_populates="user", uselist=False)
    transactions = relationship("Transaction", back_populates="user", foreign_keys="Transaction.user_id")


class EconomicProfile(Base):
    __tablename__ = "economic_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    identity_score = Column(Integer, default=0)
    transaction_score = Column(DECIMAL(5, 2), default=0.0)
    activity_score = Column(DECIMAL(5, 2), default=0.0)
    vouch_score = Column(DECIMAL(5, 2), default=0.0)
    profile_completeness = Column(DECIMAL(5, 2), default=0.0)

    skills = Column(ARRAY(Text), default=[])
    trade_category = Column(String(100), nullable=True)

    total_transaction_volume = Column(DECIMAL(15, 2), default=0.0)
    total_transaction_count = Column(Integer, default=0)
    avg_monthly_volume = Column(DECIMAL(15, 2), default=0.0)

    vouch_count = Column(Integer, default=0)
    verified_vouch_count = Column(Integer, default=0)

    risk_tier = Column(String(10), default="high")
    is_finance_eligible = Column(Boolean, default=False)
    max_loan_amount = Column(DECIMAL(15, 2), default=0.0)

    user = relationship("User", back_populates="economic_profile")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    counterparty_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    squad_reference = Column(String(255), unique=True, nullable=True)
    type = Column(String(30), nullable=False)
    category = Column(String(50), nullable=True)
    amount = Column(DECIMAL(15, 2), nullable=False)
    status = Column(String(20), default="pending")
    metadata_ = Column("metadata", JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="transactions", foreign_keys=[user_id])


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    posted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String(30), nullable=False)
    skills_required = Column(ARRAY(Text), default=[])
    languages_required = Column(ARRAY(Text), default=[])
    state = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    latitude = Column(DECIMAL(9, 6), nullable=True)
    longitude = Column(DECIMAL(9, 6), nullable=True)
    is_remote = Column(Boolean, default=False)
    pay_min = Column(DECIMAL(15, 2), nullable=True)
    pay_max = Column(DECIMAL(15, 2), nullable=True)
    status = Column(String(20), default="open")
    escrow_reference = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class OpportunityApplication(Base):
    __tablename__ = "opportunity_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    match_score = Column(Float, nullable=True)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)


class Vouch(Base):
    __tablename__ = "vouches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    voucher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    vouchee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    is_verified = Column(Boolean, default=False)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class MarketIntelligence(Base):
    __tablename__ = "market_intelligence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    demand_index = Column(Integer, default=0)
    trend_direction = Column(String(20), default="stable")
    avg_transaction_value = Column(DECIMAL(15, 2), default=0.0)
    transaction_count = Column(Integer, default=0)
    insights = Column(JSONB, default=[])
    week_start = Column(DateTime, nullable=False)
    week_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class GigOutcome(Base):
    __tablename__ = "gig_outcomes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    was_accepted = Column(Boolean, default=False)
    was_completed = Column(Boolean, default=False)
    was_rehired = Column(Boolean, default=False)
    was_vouched = Column(Boolean, default=False)
    employer_rating = Column(Float, nullable=True)
    match_score_at_time = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
