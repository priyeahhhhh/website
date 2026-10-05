<script>
	const roles = [
		{
			period: 'Aug 2025 – May 2026',
			title: 'Graduate Teaching Assistant',
			company: 'University of Texas at Arlington',
			sections: [
				{
					subtitle: null,
					bullets: [
						{ text: 'Instructed graduate students in Python, SQL, Supply Chain, and Business Statistics, facilitating analytical debugging for <span class="tldr-em">200+ students</span>', key: true },
						{ text: 'Evaluated advanced technical assessments, maintaining consistent grading standards across 2 semesters', key: false }
					]
				}
			]
		},
		{
			period: 'Jun 2025 – Aug 2025',
			title: 'Business Analytics Associate',
			company: 'Sigma Corporation',
			sections: [
				{
					subtitle: null,
					bullets: [
						{ text: 'Audited landed costs for <span class="tldr-em">50+ accounts</span> in Excel, surfacing gross margin insights that informed pricing strategy', key: true },
						{ text: 'Analyzed <span class="tldr-em">$13M in inventory</span> to identify the top 30% of customers driving 70% of profits, enabling Cost-to-Serve prioritization', key: true },
						{ text: 'Prepared 75,000+ records in Python (Jupyter) as ML training data to automate HTS code assignment: standardized product descriptions and material names, removed null records, and used pre-verified HTS codes as ground truth', key: false },
						{ text: 'Led <span class="tldr-em">financial due diligence</span> for an acquisition target, using SQL to analyze 3-year sales trends and gross margin performance for executive decision-making; found sales were consistent', key: true }
					]
				}
			]
		},
		{
			period: 'Aug 2023 – May 2024',
			title: 'Business Analyst Intern',
			company: 'Quick Tech Hire',
			sections: [
				{
					subtitle: null,
					bullets: [
						{ text: 'Analyzed recruitment data in Excel to transform sourcing strategies, reducing candidate <span class="tldr-em">cost-per-hire by 8%</span>', key: true },
						{ text: 'Visualized recruitment performance metrics in Tableau to support hiring decisions across multiple departments', key: false }
					]
				}
			]
		},
		{
			period: 'Mar 2022 – May 2022',
			title: 'Business Development Associate',
			company: 'Urban Company',
			sections: [
				{
					subtitle: null,
					bullets: [
						{ text: 'Launched the "Daily Chefs" vertical by establishing pricing and logistics for <span class="tldr-em">11 providers</span>', key: true },
						{ text: 'Boosted provider earnings by <span class="tldr-em">14%</span> by tracking KPIs and implementing pricing strategies that increased utilization by 16%', key: true }
					]
				}
			]
		}
	];
</script>

<section id="about" class="mx-auto max-w-5xl px-6 py-10 md:py-16">
	<!-- mb-8 (was mb-1) keeps the gap to the list now that the subtitle below is commented out -->
	<h2 class="mb-8 text-balance text-xl font-semibold text-ink md:text-2xl">experience</h2>
	<!-- <p class="mb-8 text-sm text-pretty text-ink-muted">Analytics work across pricing, supply chain, and hiring.</p> -->

	<div class="flex flex-col gap-8">
		{#each roles as role}
			<div class="grid gap-2 md:grid-cols-[1fr_180px] md:gap-6">
				<div>
					<h3 class="text-balance text-base font-semibold text-ink">{role.title}</h3>
					<p class="mb-3 text-sm text-ink-light">{role.company}</p>

					{#each role.sections as section, i}
						{#if section.subtitle}
							<p class="mt-3 mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">{section.subtitle}</p>
						{/if}
						<ul class="flex flex-col gap-1 {i < role.sections.length - 1 ? 'mb-2' : ''}">
							{#each section.bullets as bullet}
								<li class="flex gap-2 text-pretty text-sm text-ink-light {bullet.key ? '' : 'tldr-fade'}">
									<span class="mt-1.5 size-1 shrink-0 rounded-full bg-ink-muted"></span>
									<!-- @html safe: bullet.text is static content from roles array only -->
									<span>{@html bullet.text}</span>
								</li>
							{/each}
						</ul>
					{/each}
				</div>
				<div class="text-xs text-ink-muted md:pt-0.5 md:text-right">{role.period}</div>
			</div>
		{/each}
	</div>
</section>
