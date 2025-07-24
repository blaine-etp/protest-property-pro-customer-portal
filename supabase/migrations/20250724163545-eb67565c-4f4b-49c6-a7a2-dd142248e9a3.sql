-- Fix county page content for all counties to include properly formatted highlighted sections
UPDATE counties 
SET page_content = '
<p>Property tax appeals in Texas can result in significant savings for homeowners and businesses. Understanding the process and having the right support can make the difference between a successful appeal and a missed opportunity.</p>

<div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 24px 0;">
  <h3 style="color: #0369a1; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">💡 Key Benefits of Property Tax Appeals</h3>
  <ul style="margin: 0; padding-left: 20px; color: #374151;">
    <li>Reduce your annual property tax burden</li>
    <li>Increase your property''s cash flow</li>
    <li>Professional representation throughout the process</li>
    <li>No upfront costs - we only get paid when you save</li>
  </ul>
</div>

<h2>How Property Tax Appeals Work</h2>
<p>The property tax appeal process involves challenging your property''s assessed value with the local appraisal district. Our team of experts handles every aspect of your appeal, from initial evaluation to final resolution.</p>

<div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin: 24px 0;">
  <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">🎯 Our Success Process</h3>
  <ol style="margin: 0; padding-left: 20px; color: #374151;">
    <li><strong>Property Analysis:</strong> We evaluate your property''s current assessment</li>
    <li><strong>Evidence Collection:</strong> We gather comparable sales and market data</li>
    <li><strong>Filing & Representation:</strong> We handle all paperwork and represent you at hearings</li>
    <li><strong>Results Delivery:</strong> We secure the maximum possible reduction in your assessed value</li>
  </ol>
</div>

<h2>Why Choose Professional Representation</h2>
<p>Property tax appeals require detailed knowledge of local assessment practices, market conditions, and legal procedures. Our experienced team has successfully appealed thousands of properties, saving clients millions in property taxes.</p>

<div style="background-color: #fefce8; border: 1px solid #eab308; border-radius: 8px; padding: 16px; margin: 24px 0;">
  <h3 style="color: #a16207; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">⚠️ Important Deadlines</h3>
  <p style="margin: 0; color: #374151;">Property tax appeal deadlines are strict and vary by county. Missing these deadlines means waiting another year to challenge your assessment. Contact us early to ensure your appeal is filed on time.</p>
</div>

<h2>Get Started Today</h2>
<p>Ready to reduce your property taxes? Our team is here to help you navigate the appeal process and maximize your savings. Contact us for a free property evaluation and see how much you could save.</p>
'
WHERE status = 'published' AND id != (
  SELECT id FROM counties WHERE name = 'Angelina' AND state = 'Texas' LIMIT 1
);