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
    full_name = Column(String(255), nullable=True)
    phone = Column(String(20), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    password_hash = Column(Text, nullable=False)
    role = Column(ARRAY(Text), default=[])
    state = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    latitude = Column(DECIMAL(9, 6), nullable=True)
    longitude = Column(DECIMAL(9, 6), nullable=True)
    squad_customer_id = Column(String(255), nullable=True)
    virtual_account_no = Column(String(50), nullable=True)
    is_phone_verified = Column(Boolean, default=False)
    languages = Column(ARRAY(Text), default=[])
    preferred_language = Column(String(20), default="en")
    data_sharing_consent = Column(Boolean, default=False)
    otp_code = Column(Text, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    onboarding_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    economic_profile = relationship("EconomicProfile", back_populates="user", uselist=False)
    transactions = relationship("Transaction", back_populates="user", foreign_keys="Transaction.user_id")
    disputes = relationship("Dispute", back_populates="raiser")


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
    years_active = Column(Integer, nullable=True)
    is_profile_verified = Column(Boolean, default=False)

    total_transaction_volume = Column(DECIMAL(15, 2), default=0.0)
    total_transaction_count = Column(Integer, default=0)
    avg_monthly_volume = Column(DECIMAL(15, 2), default=0.0)
    last_transaction_at = Column(DateTime, nullable=True)

    vouch_count = Column(Integer, default=0)
    verified_vouch_count = Column(Integer, default=0)

    risk_tier = Column(String(10), default="high")
    is_finance_eligible = Column(Boolean, default=False)
    max_recommended_loan = Column(DECIMAL(15, 2), default=0.0)
    last_active = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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
    currency = Column(String(5), default="NGN")
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
    currency = Column(String(5), default="NGN")
    status = Column(String(20), default="open")
    selected_applicant = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    payment_method = Column(String(20), default="squad")
    escrow_reference = Column(String(255), nullable=True)
    worker_confirmed = Column(Boolean, default=False)
    worker_confirmed_at = Column(DateTime, nullable=True)
    employer_confirmed = Column(Boolean, default=False)
    employer_confirmed_at = Column(DateTime, nullable=True)
    auto_release_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    disputes = relationship("Dispute", back_populates="opportunity")


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=False)
    raised_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    evidence = Column(ARRAY(Text), default=[])
    status = Column(String(20), default="open")
    resolution = Column(String(20), nullable=True)
    resolution_note = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    opportunity = relationship("Opportunity", back_populates="disputes")
    raiser = relationship("User", back_populates="disputes")


class OpportunityApplication(Base):
    __tablename__ = "opportunity_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=False)
    applicant_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="pending")
    match_score = Column(DECIMAL(5, 2), nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow)


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
