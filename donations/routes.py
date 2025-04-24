# donations/routes.py
from flask import render_template, redirect, url_for, flash, request, jsonify
from . import donations_bp
from .models import Donation
from .extensions import db, mail, stripe
import os
import logging

logger = logging.getLogger(__name__)

@donations_bp.route('/donate', methods=['GET'])
def donation_form():
    """Render the donation form page"""
    stripe_public_key = os.getenv('STRIPE_PUBLIC_KEY')
    return render_template('donation_form.html', stripe_public_key=stripe_public_key)

@donations_bp.route('/process_donation', methods=['POST'])
def process_donation():
    """Process donation form submission"""
    try:
        # Get form data
        amount = request.form.get('amount')
        if amount == 'custom':
            amount = request.form.get('custom_amount')
        
        amount = float(amount)
        payment_method = request.form.get('payment_method')
        email = request.form.get('email')
        save_card = True if request.form.get('save_card') else False
        
        # Check if minimum donation amount is met
        if amount < 1.0:
            flash('Donation amount must be at least $1.00')
            return redirect(url_for('donations.donation_form'))
        
        # Process based on payment method
        if payment_method == 'credit_card':
            name_on_card = request.form.get('name_on_card')
            card_number = request.form.get('card_number')
            card_expiry = request.form.get('card_expiry')
            
            # Validate card details (basic validation)
            if not (name_on_card and card_number and card_expiry):
                flash('Please fill in all card details')
                return redirect(url_for('donations.donation_form'))
            
            # Process payment with Stripe
            try:
                # Create a payment intent with Stripe
                payment_intent = stripe.PaymentIntent.create(
                    amount=int(amount * 100),  # Convert to cents
                    currency='usd',
                    description=f'Water Charity Donation',
                    receipt_email=email
                )
                
                # For demo purposes, we'll simulate a successful payment
                # In production, you would handle the complete Stripe payment flow
                
                # Store donation in database
                donation = Donation(
                    amount=amount,
                    payment_method=payment_method,
                    email=email,
                    name=name_on_card,
                    card_last4=card_number[-4:] if card_number else None,
                    stripe_payment_id=payment_intent.id,
                    save_card=save_card
                )
                db.session.add(donation)
                db.session.commit()
                
                # Send receipt email
                send_receipt_email(donation)
                
                flash('Thank you for your donation!')
                return redirect(url_for('donations.donation_success', donation_id=donation.id))
                
            except stripe.error.StripeError as e:
                logger.error(f"Stripe error: {str(e)}")
                flash('Payment processing error. Please try again.')
                return redirect(url_for('donations.donation_form'))
                
        elif payment_method == 'paypal':
            # For PayPal, we would typically redirect to PayPal's site
            # For demo purposes, we'll simulate a successful PayPal payment
            
            # Store donation in database
            donation = Donation(
                amount=amount,
                payment_method=payment_method,
                email=email,
                save_card=save_card
            )
            db.session.add(donation)
            db.session.commit()
            
            # Send receipt email
            send_receipt_email(donation)
            
            flash('Thank you for your donation!')
            return redirect(url_for('donations.donation_success', donation_id=donation.id))
        
        else:
            flash('Invalid payment method')
            return redirect(url_for('donations.donation_form'))
            
    except Exception as e:
        logger.error(f"Error processing donation: {str(e)}")
        flash('An error occurred. Please try again.')
        return redirect(url_for('donations.donation_form'))

@donations_bp.route('/donation_success/<donation_id>')
def donation_success(donation_id):
    """Display donation success page"""
    donation = Donation.query.get_or_404(donation_id)
    return render_template('donation_success.html', donation=donation)

def send_receipt_email(donation):
    """Send donation receipt via email"""
    try:
        from flask_mail import Message
        
        msg = Message(
            subject="Thank You for Your Water Charity Donation",
            recipients=[donation.email]
        )
        
        msg.html = render_template(
            'email/receipt.html',
            donation=donation,
            timestamp=donation.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        )
        
        mail.send(msg)
        
        # Update donation record
        donation.receipt_sent = True
        db.session.commit()
        
        return True
    except Exception as e:
        logger.error(f"Error sending receipt: {str(e)}")
        return False

@donations_bp.route('/api/validate_card', methods=['POST'])
def validate_card():
    """API endpoint to validate card details"""
    data = request.get_json()
    
    # Basic validation (in production, use a proper validation library)
    card_number = data.get('card_number', '').replace(' ', '')
    is_valid = len(card_number) >= 13 and card_number.isdigit()
    
    return jsonify({
        'valid': is_valid
    })

# Webhook handler for Stripe events (for production use)
@donations_bp.route('/webhooks/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv('STRIPE_WEBHOOK_SECRET')
        )
        
        # Handle specific events
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            # Update donation status in your database
            handle_successful_payment(payment_intent.id)
            
        # Add more event handlers as needed
        
        return jsonify(success=True)
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return jsonify(success=False), 400

def handle_successful_payment(payment_id):
    """Handle successful payment webhook from Stripe"""
    donation = Donation.query.filter_by(stripe_payment_id=payment_id).first()
    
    if donation:
        # Update status or perform additional actions
        if not donation.receipt_sent:
            send_receipt_email(donation)
    else:
        logger.warning(f"Payment received but no matching donation found: {payment_id}")