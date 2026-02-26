function ProjectCard({ title, tags, link }) {
  return (
    <a href={link} className="project-card">
      <h3>{title}</h3>
      <div className="tags">
        {tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      <span className="project-link">View App →</span>
    </a>
  )
}

function App() {
  return (
    <div className="container">
      <section className="hero">
        <h1>Mordecai Coleman</h1>
        <p className="subtitle">Software Developer</p>

        {/* TODO: replace with your real bio */}
        <p className="bio">
          Software engineering student building full-stack projects with a focus on
          backend systems and databases. Currently working through capstone prep —
          learning how production stacks fit together.
        </p>

        <div className="links">
          <a
            href="https://www.linkedin.com/in/mordecai-coleman-14572630a/"
            className="btn-link"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn ↗
          </a>
          <a
            href="https://github.com/mordcole"
            className="btn-link"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
        </div>
      </section>

      <section className="projects">
        <h2>Projects</h2>
        <ProjectCard
          title="Dual-Database Counter App"
          tags={['Nginx', 'Node', 'Postgres', 'MongoDB']}
          link="/counter"
        />
      </section>
    </div>
  )
}

export default App
